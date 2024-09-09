import { Tender } from "../models/interfaces/tender";
import { TenderItem } from "../models/interfaces/tender-item";
import { fDate, fString } from "../format";

export const getNetUnitAmount = (amount: number, surcharge: number) => amount * (1 + (Number(surcharge) / 100));

export const getNetAmount = (item: TenderItem, surcharge: number) => {
  const materialNetUnitAmount = getNetUnitAmount(item.materialNetUnitAmount, surcharge);
  const feeNetUnitAmount = getNetUnitAmount(item.feeNetUnitAmount, surcharge);

  return {
    materialNetUnitAmount,
    feeNetUnitAmount,
    materialNetAmount: materialNetUnitAmount * item.quantity,
    feeNetAmount: feeNetUnitAmount * item.quantity,
  };
};

export const getTotalNetAmount = (tender: Tender) => {
  const discount = 1 - (Number(tender.discount) / 100);

  const netAmount = tender.items?.reduce(
    (acc, item) => {
      const { materialNetAmount, feeNetAmount } = getNetAmount(item, tender.surcharge || 0);
      return acc + ((materialNetAmount + feeNetAmount) * discount);
    },
    0
  );

  const surveyFee = tender.fee! > 0 && tender.returned ? tender.fee : 0;
  return netAmount! - surveyFee!;
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
      const { materialNetAmount, feeNetAmount, materialNetUnitAmount, feeNetUnitAmount } = getNetAmount(item, tender.surcharge || 0);
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
  const feeActualNetAmount = feeNetUnitAmount * quantity * (1 + (Number(surcharge) / 100)) * (1 - (Number(discount) / 100)),

  return {
    materialActualNetAmount,
    feeActualNetAmount,
    totalMaterialAmount: materialActualNetAmount * (Number(vatKey) / 100),
    totalFeeAmount: feeActualNetAmount * (Number(vatKey) / 100)
  }
}