import React from 'react';
import { Style } from '@react-pdf/types';
import { useMemo } from 'react';
import { Tender } from '../models/interfaces/tender';
import {
  getDiscountAmount, getNetAmount, getRoundAmount,
  getTotalAmount, getTotalNetAmount, getTotalVatAmount
} from '../helpers/tender';
import { fDate, fPercent, fCurrency } from "../format";
import { DocumentModel } from '../models/document';

type TenderPDFProps = {
  tender: Tender;
};

const TenderPDF = ({ tender }: TenderPDFProps) => {
  let styles: any, Page: any, View: any, Text: any, Font: any, Image: any, StyleSheet: any, Document: any;

  React.useEffect(() => {
    const useStyles = () =>
      useMemo(
        () =>
          StyleSheet.create({
            col3: { width: '33%' },
            col4: { width: '25%' },
            col8: { width: '75%' },
            col6: { width: '50%' },
            mb4: { marginBottom: 2 },
            mb8: { marginBottom: 4 },
            mb20: { marginBottom: 10 },
            mb40: { marginBottom: 20 },
            h1: {
              fontWeight: 800,
              lineHeight: 80 / 64,
              fontSize: 32
            },
            h2: {
              fontWeight: 800,
              lineHeight: 64 / 48,
              fontSize: 22
            },
            h3: { fontSize: 13, fontWeight: 700 },
            h4: { fontSize: 10, fontWeight: 700 },
            h6: { fontSize: 8, fontWeight: 500 },
            body1: { fontSize: 8 },
            body2: { fontSize: 7 },
            subtitle1: { fontSize: 9, fontWeight: 700 },
            subtitle2: { fontSize: 8, fontWeight: 700 },
            alignRight: { textAlign: 'right' },
            page: {
              fontSize: 8,
              lineHeight: 1.3,
              fontFamily: 'Roboto',
              backgroundColor: '#FFFFFF',
              padding: '40px 24px 120px 24px',
            },
            title: {
              color: '#33478a'
            },
            viewHeader: {
              backgroundColor: '#4b6999',
            },
            box: {
              border: '1px solid #f2f2f2'
            },
            dotted: {
              borderTop: '1px dotted #4b6999'
            },
            boxHeader: {
              backgroundColor: '#5889ad',
              color: 'white',
              paddingLeft: 4,
              paddingTop: 1,
              paddingBottom: 1,
              // height: 20
              // alignItems: 'center',
            },
            boxContent: {
              paddingLeft: 4,
              paddingTop: 1,
              paddingBottom: 1,
              // minHeight: 20,
            },
            summaryContent: {
              paddingLeft: 4,
              paddingTop: 1,
              paddingBottom: 1,
              // minHeight: 15,
            },
            boxShadow: {
              backgroundColor: '#ecf2f4'
            },
            footer: {
              left: 0,
              right: 0,
              bottom: 0,
              padding: 8,
              margin: 'auto',
              borderTopWidth: 1,
              borderStyle: 'solid',
              position: 'absolute',
              borderColor: '#DFE3E8',
            },
            gridContainer: {
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
            table: {
              display: 'flex',
              width: 'auto',
              border: '1px solid #f2f2f2'
            },
            tableHeader: {
              backgroundColor: '#5889ad',
              color: 'white',
              // height: 25,
              fontSize: 8,
              flexDirection: 'row',
              paddingLeft: 4,
              paddingTop: 1,
              paddingBottom: 1,
              lineHeight: 1
            },
            tableRow: {
              height: 'auto',
              // minHeight: 20,
              paddingLeft: 4,
              paddingTop: 1,
              paddingBottom: 1,
              flexDirection: 'row',
              fontSize: 8,
            },
            noBorder: {
              paddingTop: 1,
              paddingBottom: 1,
              borderBottomWidth: 0,
            },
            tableCell_1: {
              width: '3%',
              textAlign: 'left',
              whiteSpace: 'normal',
              lineBreak: 'auto'
            },
            tableCell_4: {
              width: '10%',
              textAlign: 'right',
            },
            tableCell_2: {
              width: '12.8%',
              paddingRight: 16,
              textAlign: 'right',
            },
            tableCell_3: {
              width: '23%',
              textAlign: 'left',
            },
            bold: {
              fontWeight: 700
            },
            none: {}
          }),
        []
      );
    
    const importComponent = async () => {
      const components = await import('@react-pdf/renderer');
      Page = components.Page;
      View = components.View;
      Text = components.Text;
      Font = components.Font;
      Image = components.Image;
      StyleSheet = components.StyleSheet;
    };

    if (!!Font) {
      Font.register({
        family: 'Roboto',
        fonts: [{ src: 'src/react/assets/Roboto-Regular.ttf' }, { src: 'src/react/assets/Roboto-Bold.ttf' }],
      });
    }

    if (!!StyleSheet && !styles) {
      styles = useStyles();
    }
    
    importComponent();
  }, [tender]);

  const getImage = (type: "logo" | "signature" | "stamp"): string | null => {
    if (!tender?.contractor?.documents) return null;
    const documents = tender.contractor.documents as DocumentModel[];
    const image = documents.find((doc) => doc.type === type);
    return image?.stored?.resized || null;
  };

  const TenderCustomerLogo = () => {
    const imageData = getImage("logo");
    if (!imageData) {
      return <View style={{ height: 65 }} />
    }

    return (<Image source={imageData} style={{ height: 65, width: "auto" }} />)
  }

  const TenderCustomerStamp = () => {
    const imageData = getImage("stamp");
    if (!imageData) {
      return <View style={{ height: 25 }} />
    }

    return (<Image source={imageData} style={{ width: 115, height: "auto" }} />)
  }

  const TenderCustomerSignature = () => {
    const imageData = getImage("signature");
    if (!imageData) {
      return <View style={{ height: 25 }} />
    }

    return (<Image source={imageData} style={{ width: 100, height: "auto" }} />)
  }

  const TenderDiscount = () => {
    if (!tender?.discount) return null;
    const sumAmounts = getDiscountAmount(tender);

    return (
      <View style={[styles.tableRow, tender!.items!.length! % 2 !== 0 ? styles.boxShadow : styles.none]}>
        <View style={styles.tableCell_1}><Text /></View>
        <View style={styles.tableCell_3}><Text>{fPercent(tender.discount)} Kedvezmény</Text></View>
        <View style={styles.tableCell_4}><Text>1 db</Text></View>
        <View style={styles.tableCell_2}><Text>{fCurrency(0)}</Text></View>
        <View style={styles.tableCell_2}><Text>{fCurrency(0)}</Text></View>
        <View style={styles.tableCell_2}><Text>- {fCurrency(sumAmounts!.sumMaterialNetAmount, 0)}</Text></View>
        <View style={styles.tableCell_2}><Text>- {fCurrency(sumAmounts!.sumFeeNetAmount, 0)}</Text></View>
        <View style={styles.tableCell_2}><Text style={styles.bold}>- {fCurrency(sumAmounts!.sumFeeNetAmount + sumAmounts!.sumMaterialNetAmount, 0)}</Text></View>
      </View>
    );
  };

  const TenderSurveyFee = () => {
    if (!tender.fee || tender.fee == 0 || (tender.fee > 0 && !tender.returned)) return null;
    const hasDiscount = tender.discount && tender.discount > 0;
    const index = hasDiscount ? tender.items!.length! + 1 : tender.items!.length!;

    return (
      <View style={[styles.tableRow, index % 2 !== 0 ? styles.boxShadow : styles.none]}>
        <View style={styles.tableCell_1}><Text /></View>
        <View style={styles.tableCell_3}><Text>Felmérési díj</Text></View>
        <View style={styles.tableCell_4}><Text>1 db</Text></View>
        <View style={styles.tableCell_2}><Text>{fCurrency(0)}</Text></View>
        <View style={styles.tableCell_2}><Text>- {fCurrency(tender.fee)}</Text></View>
        <View style={styles.tableCell_2}><Text>{fCurrency(0)}</Text></View>
        <View style={styles.tableCell_2}><Text>- {fCurrency(tender.fee)}</Text></View>
        <View style={styles.tableCell_2}><Text style={styles.bold}>- {fCurrency(tender.fee)}</Text></View>
      </View>
    );
  };

  const TenderHeader = () => (
    <View style={[styles.gridContainer, styles.mb4]}>
      <View style={{ flexDirection: 'column' }}>
        <Text style={[styles.h2, styles.title]}>AJÁNLAT</Text>
      </View>
      <View style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
        <TenderCustomerLogo />
      </View>
    </View>
  );

  const TenderInfo = () => (
    <View style={[styles.gridContainer, styles.mb4]}>
      <View style={[styles.box, styles.col6]}>
        <View style={[styles.boxHeader]}><Text>Kivitelező</Text></View>
        <View style={[styles.boxContent]}>
          <Text>{tender?.contractor?.name}</Text>
          <Text>{tender?.contractor?.zipCode} {tender?.contractor?.city}, {tender?.contractor?.address}</Text>
          <Text>Adószám: {tender?.contractor?.taxNumber || "-"}</Text>
          <Text>Bankszámla: {tender?.contractor?.bankAccount || "-"}</Text>
          <Text>E-mail: {tender?.contractor?.email || "-"}</Text> 
        </View>
      </View>
      <View style={[styles.box, styles.col6]}>
        <View style={[styles.boxHeader]}><Text>Megrendelő</Text></View>
        <View style={[styles.boxContent]}>
          <Text>{tender?.customer?.name}</Text>
          <Text>Adószám: {tender?.customer?.taxNumber || "-"}</Text>
          <Text>Helyszín: {tender?.location?.zipCode} {tender?.location?.city}, {tender?.location?.address}</Text>
        </View>
      </View>
    </View>
  );

  const TenderDetails = () => (
    <View style={[styles.gridContainer, styles.mb4]}>
      <View style={[styles.box, styles.col3]}>
        <View style={[styles.boxHeader]}><Text>Kiállítás</Text></View>
        <View style={[styles.boxContent, styles.boxShadow]}><Text>{fDate(tender?.openDate)}</Text></View>
      </View>
      <View style={[styles.box, styles.col3]}>
        <View style={[styles.boxHeader]}><Text>Érvényesség</Text></View>
        <View style={[styles.boxContent, styles.boxShadow]}><Text>{fDate(tender?.validTo)}</Text></View>
      </View>
      <View style={[styles.box, styles.col3]}>
        <View style={[styles.boxHeader]}><Text>Ajánlatszám</Text></View>
        <View style={[styles.boxContent, styles.boxShadow]}><Text>{tender?.number || "-"}</Text></View>
      </View>
    </View>
  );

  const TenderNotes = () => (
    <View style={[styles.mb4, styles.box]}>
      <View style={[styles.boxHeader]}><Text>Leírás</Text></View>
      <View style={[styles.boxContent]}><Text>{tender?.notes}</Text></View>
    </View>
  );

  const SummaryRow = ({ label, value, style }: { label: string, value: string, style: Style[] }) => (
    <View style={[styles.gridContainer, ...style, styles.summaryContent]}>
      <Text>{label}:</Text>
      <Text>{value}</Text>
    </View>
  );

  const TenderSummary = () => (
    <View style={[styles.gridContainer, styles.mb4]}>
      <View style={[styles.col6]} />
      <View style={[styles.col6]}>
        <SummaryRow
          label="ÁFA-kulcs"
          value={fPercent(Number(tender.vatKey)) ?? tender.vatKey}
          style={[styles.body1]}
        />
        <SummaryRow
          label="Nettó érték"
          value={fCurrency(getTotalNetAmount(tender))}
          style={[styles.h6]}
        />
        <SummaryRow
          label="ÁFA tartalom"
          value={fCurrency(getTotalVatAmount(tender))}
          style={[styles.h6]}
        />
        <SummaryRow
          label="Kerekítés"
          value={fCurrency(getRoundAmount(tender))}
          style={[styles.body1]}
        />
        <SummaryRow
          label="Végösszeg"
          value={fCurrency(Math.ceil(getTotalAmount(tender)))}
          style={[styles.boxShadow, styles.h4]}
        />
      </View>
    </View>
  )

  const TenderTable = () => (
    <View style={styles.table}>
      <View>
        <View style={[styles.tableHeader]}>
          <View style={styles.tableCell_1}><Text>S.</Text></View>
          <View style={styles.tableCell_3}><Text>Tétel</Text></View>
          <View style={styles.tableCell_4}><Text>Mennyiség</Text></View>
          <View style={styles.tableCell_2}><Text>Anyag nettó egységár</Text></View>
          <View style={styles.tableCell_2}><Text>Munkadíj nettó egységár</Text></View>
          <View style={styles.tableCell_2}><Text>Anyag nettó érték</Text></View>
          <View style={styles.tableCell_2}><Text>Munkadíj nettó érték</Text></View>
          <View style={styles.tableCell_2}><Text>Nettó összeg összesen</Text></View>
        </View>
      </View>
      <View>
        {tender?.items?.map((item, index) => {
          const amounts = getNetAmount(item, tender.surcharge || 0);
          return (
            <View style={[styles.tableRow, (index + 1) % 2 === 0 ? styles.boxShadow : styles.none]} key={index}>
              <View style={styles.tableCell_1}><Text>{index + 1}</Text></View>
              <View style={styles.tableCell_3}><Text>{item.name}</Text></View>
              <View style={styles.tableCell_4}><Text>{item.quantity} {item.unit}</Text></View>
              <View style={styles.tableCell_2}><Text>{fCurrency(amounts.materialNetUnitAmount, 2)}</Text></View>
              <View style={styles.tableCell_2}><Text>{fCurrency(amounts.feeNetUnitAmount, 2)}</Text></View>
              <View style={styles.tableCell_2}><Text>{fCurrency(amounts.materialNetAmount, 0)}</Text></View>
              <View style={styles.tableCell_2}><Text>{fCurrency(amounts.feeNetAmount, 0)}</Text></View>
              <View style={styles.tableCell_2}>
                <Text style={styles.bold}>{fCurrency(amounts.materialNetAmount + amounts.feeNetAmount, 0)}</Text>
              </View>
            </View>
          );
        })}
        <TenderDiscount />
        <TenderSurveyFee />
      </View>
    </View>
  );

  const TenderSignature = () => (
    <View>
      <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
        <View style={[styles.col4, { width: 225, textAlign: "center" }]} />
         <View style={[styles.col4, { width: 225, textAlign: "center", alignContent: "center", alignItems: "center" }]}>
          <TenderCustomerStamp />
          <TenderCustomerSignature />
        </View>
      </View>
      <View style={[styles.gridContainer]}>
        <View style={[styles.col4, styles.dotted, { width: 225, textAlign: "center" }]}>
          <Text>Megrendelő</Text>
        </View>
        <View style={[styles.col4, styles.dotted, { width: 225, textAlign: "center" }]}>
          <Text>Kivitelező</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <TenderHeader />
        <TenderInfo />
        <TenderDetails />
        <TenderNotes />
        <TenderTable />
        <TenderSummary />
        <TenderSignature />
      </Page>
    </Document>
  );
};

export default TenderPDF;