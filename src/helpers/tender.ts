import { Tender } from "../models/interfaces/tender";
import { TenderItem } from "../models/interfaces/tender-item";
import { fDate, fString } from "../format";

export const getNetUnitAmount = (amount: number, surcharge: number) => amount * (1 + (Number(surcharge) / 100));

export const getItemNetAmount = (item: TenderItem) => {
  const discount = 1 - (Number(item.tender?.discount || 0) / 100);
  const surcharge = 1 + (Number(item.tender?.surcharge || 0) / 100);

  const { materialNetAmount, feeNetAmount } = getNetAmount(item);
  return (materialNetAmount + feeNetAmount) * surcharge * discount;
}

export const getItemVatAmount = (item: TenderItem) => {
  const vatKey = Number(item.tender?.vatKey) || 0;
  const netAmount = getItemNetAmount(item);

  return netAmount * (vatKey / 100);
}

export const getNetAmount = (item: TenderItem) => {
  const { materialNetUnitAmount, feeNetUnitAmount } = item;

  return {
    materialNetUnitAmount,
    feeNetUnitAmount,
    materialNetAmount: materialNetUnitAmount * item.quantity,
    feeNetAmount: feeNetUnitAmount * item.quantity,
  };
};

export const getTotalNetAmount = (tender: Tender) => {
  const discount = 1 - (Number(tender.discount) / 100);
  const surcharge = 1 + (Number(tender.surcharge) / 100);

  const items = tender.items || [];
  const netAmount = items.reduce(
    (acc, item) => {
      const { materialNetAmount, feeNetAmount } = getNetAmount(item);
      return acc + (materialNetAmount + feeNetAmount);
    },
    0
  );

  const fee = tender.fee || 0;
  const surveyFee = fee > 0 && tender.returned ? fee : 0;
  return (netAmount * surcharge * discount) - surveyFee;
}

export const getTotalVatAmount = (tender: Tender) => {
  const vatKey = Number(tender.vatKey) || 0;
  const netAmount = getTotalNetAmount(tender);
  return netAmount * (vatKey / 100);
}

export const getTotalAmount = (tender: Tender) => {
  const netAmount = getTotalNetAmount(tender);
  const vatAmount = getTotalVatAmount(tender);
  return netAmount + vatAmount;
}

export const getRoundAmount = (tender: Tender) => {
  const totalAmount = getTotalAmount(tender);
  return Math.ceil(totalAmount) - totalAmount;
}

export const getDiscountAmount = (tender: Tender) => {
  const discount = Number(tender.discount) / 100;

  return tender.items?.reduce(
    (acc, item) => {
      const { materialNetAmount, feeNetAmount, materialNetUnitAmount, feeNetUnitAmount } = getNetAmount(item);
      return {
        sumMaterialNetUnitAmount: acc.sumMaterialNetUnitAmount + materialNetUnitAmount * discount,
        sumFeeNetUnitAmount: acc.sumFeeNetUnitAmount + feeNetUnitAmount * discount,
        sumMaterialNetAmount: acc.sumMaterialNetAmount + materialNetAmount * discount,
        sumFeeNetAmount: acc.sumFeeNetAmount + feeNetAmount * discount,
      };
    },
    {
      sumMaterialNetUnitAmount: 0,
      sumFeeNetUnitAmount: 0,
      sumMaterialNetAmount: 0,
      sumFeeNetAmount: 0,
    }
  );
}

export const sumByStatus = (tenders: Tender[], status: string = "all"): number => {
  return tenders.reduce((acc, tender) => {
    return tender.status === status || status === "all" ? acc + getTotalNetAmount(tender) : acc;
  }, 0);
};

export const generatePdfFilename = (tender: Tender) => {
  const created = fDate(tender.createdOn, "yyyyMMdd");
  const contractorName = fString(tender.contractor!.name);
  const customerName = fString(tender.customer!.name);
  const address = fString(`${tender.location!.zipCode} ${tender.location!.city}, ${tender.location!.address}`);
  const type = fString(tender.type);
  const now = fDate(new Date(), "yyyyMMddHHmm");

  return `${created}-${contractorName}-${customerName}-${address}-${type}-${now}.pdf`
};

export const calculateTenderItemAmounts = (tenderItem: TenderItem, surcharge: number, discount: number, vatKey: string) => {
  const { feeNetUnitAmount, materialNetUnitAmount, quantity } = tenderItem;

  const materialActualNetAmount = materialNetUnitAmount * quantity * (1 + (Number(surcharge) / 100)) * (1 - (Number(discount) / 100));
  const feeActualNetAmount = feeNetUnitAmount * quantity * (1 + (Number(surcharge) / 100)) * (1 - (Number(discount) / 100));

  return {
    materialActualNetAmount,
    feeActualNetAmount,
    totalMaterialAmount: materialActualNetAmount * (Number(vatKey) / 100),
    totalFeeAmount: feeActualNetAmount * (Number(vatKey) / 100)
  }
}