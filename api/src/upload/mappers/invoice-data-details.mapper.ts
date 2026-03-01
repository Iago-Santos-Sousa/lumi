import { ExtractedInvoiceData } from "src/common/interfaces";
import { parseNumber } from "src/utils";

interface IInvoiceDataDetails {
  clientNumber: string;
  installationNumber: string;
  referenceMonth: string;
  referenceDate: Date;
  client_name: string | null;
  address: string | null;
  neighborhood: string | null;
  city_state: string | null;
  document_type: string | null;
  document_number: string | null;
}

export class InvoiceDataDetailsMapper {
  static toDto(
    billingMatch: RegExpMatchArray,
    details: IInvoiceDataDetails,
  ): ExtractedInvoiceData {
    // Grupos: [1]=eeKwh [2]=eeValor [3]=sceeeKwh [4]=sceeeValor
    // [5]=compKwh [6]=compValor [7]=contrib
    const energiaEletricaKwh = parseNumber(billingMatch[1]);
    const energiaEletricaValor = parseNumber(billingMatch[2]);
    const energiaSceeeKwh = parseNumber(billingMatch[3]);
    const energiaSceeeValor = parseNumber(billingMatch[4]);
    const energiaCompensadaKwh = parseNumber(billingMatch[5]);
    const energiaCompensadaValor = parseNumber(billingMatch[6]);
    const contribIlumPublica = parseNumber(billingMatch[7]);

    // Variáveis calculada
    const consumoEnergiaEletricaKwh = energiaEletricaKwh + energiaSceeeKwh;

    const valorTotalSemGd =
      energiaEletricaValor + energiaSceeeValor + contribIlumPublica;

    const economiaGd = Math.abs(energiaCompensadaValor); // sempre positivo

    return {
      client_number: details.clientNumber,
      installation_number: details.installationNumber,
      reference_month: details.referenceMonth,
      reference_date: details.referenceDate,
      energia_eletrica_kwh: energiaEletricaKwh,
      energia_eletrica_valor: energiaEletricaValor,
      energia_sceee_kwh: energiaSceeeKwh,
      energia_sceee_valor: energiaSceeeValor,
      energia_compensada_kwh: energiaCompensadaKwh,
      energia_compensada_valor: energiaCompensadaValor,
      contrib_ilum_publica: contribIlumPublica,
      consumo_energia_eletrica_kwh: consumoEnergiaEletricaKwh,
      valor_total_sem_gd: valorTotalSemGd,
      economia_gd: economiaGd,
      client_name: details.client_name,
      address: details.address,
      neighborhood: details.neighborhood,
      city_state: details.city_state,
      document_type: details.document_type,
      document_number: details.document_number,
    };
  }
}
