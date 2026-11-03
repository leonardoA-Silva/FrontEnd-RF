import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RegistrationData } from "./registrationData";

type StateOption = { id: number; sigla: string; nome: string };
type CityOption = { id: number; nome: string };

export function useRegistrationAddress(data: RegistrationData, setData: Dispatch<SetStateAction<RegistrationData>>) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [statesStatus, setStatesStatus] = useState("loading");
  const [statesVersion, setStatesVersion] = useState(0);
  const [cityVersion, setCityVersion] = useState(0);
  const cityKey = `${data.state}:${cityVersion}`;
  const [cityResult, setCityResult] = useState<{ key: string; items: CityOption[]; error: boolean }>({ key: "", items: [], error: false });
  const [zipBusy, setZipBusy] = useState(false);
  const [zipNote, setZipNote] = useState("");
  const zipController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome", { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then((result: StateOption[]) => { if (!Array.isArray(result)) throw new Error(); setStates(result); setStatesStatus("ready"); })
      .catch(() => { if (!controller.signal.aborted) setStatesStatus("error"); });
    return () => controller.abort();
  }, [statesVersion]);

  useEffect(() => {
    if (!/^[A-Z]{2}$/.test(data.state)) return;
    const controller = new AbortController();
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${data.state}/municipios?orderBy=nome`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then((result: CityOption[]) => { if (!Array.isArray(result)) throw new Error(); setCityResult({ key: cityKey, items: result, error: false }); })
      .catch(() => { if (!controller.signal.aborted) setCityResult({ key: cityKey, items: [], error: true }); });
    return () => controller.abort();
  }, [data.state, cityKey]);

  useEffect(() => () => zipController.current?.abort(), []);

  async function lookupZip() {
    const zip = data.zip_code.replace(/\D/g, "");
    if (zip.length !== 8) return;
    zipController.current?.abort();
    const controller = new AbortController();
    zipController.current = controller;
    setZipBusy(true);
    setZipNote("");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`, { signal: controller.signal });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (result.erro) { setZipNote("CEP não encontrado. Confira ou preencha o endereço manualmente."); return; }
      setData(previous => previous.zip_code.replace(/\D/g, "") !== zip ? previous : {
        ...previous,
        street: typeof result.logradouro === "string" && result.logradouro ? result.logradouro : previous.street,
        neighborhood: typeof result.bairro === "string" && result.bairro ? result.bairro : previous.neighborhood,
        city: typeof result.localidade === "string" && result.localidade ? result.localidade : previous.city,
        state: typeof result.uf === "string" && result.uf ? result.uf : previous.state,
      });
      setZipNote("Endereço consultado. Confira e complete os dados abaixo.");
    } catch { if (!controller.signal.aborted) setZipNote("Não foi possível consultar o CEP. Preencha o endereço manualmente ou tente novamente."); }
    finally { if (!controller.signal.aborted) setZipBusy(false); }
  }

  return {
    states, statesStatus, cities: cityResult.key === cityKey ? cityResult.items : [],
    citiesBusy: /^[A-Z]{2}$/.test(data.state) && cityResult.key !== cityKey,
    citiesError: cityResult.key === cityKey && (cityResult.error || cityResult.items.length === 0),
    zipBusy, zipNote, lookupZip,
    retryStates: () => { setStatesStatus("loading"); setStatesVersion(value => value + 1); },
    retryCities: () => setCityVersion(value => value + 1),
  };
}
