'use client';

import React from 'react';
import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// This component renders the full contract in a PDF format.
const AgreementPDF = ({ data }) => {
  const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, lineHeight: 1.5, fontFamily: 'Helvetica' },
    heading: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    section: { marginBottom: 15 },
    subheading: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
    text: { marginBottom: 5 },
    signatureSection: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
    signatureText: { width: '45%', borderTop: '1px solid #000', paddingTop: 5, textAlign: 'center' },
  });

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.heading}>DIGITAL SERVICES AGREEMENT</Text>
        <Text style={styles.text}>
          This Digital Services Agreement (Herein referred to as “Agreement") is made and entered into on this {data.date} day of {data.month} {data.year}, At Delhi.
        </Text>
        <View style={styles.section}>
          <Text style={styles.text}>Between:</Text>
          <Text style={styles.text}>INNODEM DIGITAL EXPORTS PRIVATE LIMITED THROUGH ITS DIRECTOR HAVING REGISTERED OFFICE AT: {data.serviceProviderAddress}</Text>
          <Text style={styles.text}>AND</Text>
          <Text style={styles.text}>Client : {data.clientName}</Text>
          <Text style={styles.text}>[Company Address]: {data.companyAddress}</Text>
          <Text style={styles.text}>[Email Address]: {data.email}</Text>
          <Text style={styles.text}>[Phone Number]: {data.phone} (Hereinafter referred to as the “Client”)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>The Purchaser(s) acknowledge reading and understanding the entire terms and conditions and rules relating to the membership/service programs and hereby agree(s) to be bound by the rules and regulations contained therein. The membership continues until the termination date of the scheme of cancellation of Membership in accordance with the relevant provisions of rules of service.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>1. Scope of Services</Text>
          <Text style={styles.text}>
            The Service Provider who deals in providing leads and probable business deals through their contacts and leads hereby agrees to provide the following digital service to the client:
          </Text>
          <Text style={styles.text}>{data.serviceDetails}</Text>
          <Text style={styles.text}>
            A more detailed scope of services, including deliverables and timelines, is outlined in Schedule A, attached hereto.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>2. Term and Termination</Text>
          <Text style={styles.text}>2.1 This Agreement shall commence on {data.startDate} and shall continue until {data.endDate} or until terminated by either party as outlined herein.</Text>
          <Text style={styles.text}>2.2 Either party may terminate this Agreement with thirty (30) days' written notice however it is hereby clarified that once the payment is received by the service provider from the client i.e., {data.clientName} the same shall not returned in any event after signing of the present agreement as all the conditions of the said scheme taken by the client is vernacularly narrated to the client.</Text>
          <Text style={styles.text}>2.3 In the event of breach by the client, service provider may terminate the present Agreement immediately with written notice.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>3. Payment Terms and Upgradation</Text>
          <Text style={styles.text}>3.1 Additional services outside the agreed scope will be billed as per mutual understanding.</Text>
          <Text style={styles.text}>3.2 Once the payment made by the client to the service provider will not be returned after making of such payment in any event after signing of the present agreement and no false cases of fraud of cheating of misrepresentation will be entertained as all the details of the scheme has already been described to the client and after that the payment was made to the service provider by the client.</Text>
          <Text style={styles.text}>3.3 That by signing of the present agreement it has been undertaken by the client that the payment received by the service provider is legitimate one and no misrepresentation was made to get the payment dated: {data.paymentDate} by the service provider from the client.</Text>
          <Text style={styles.text}>3.4 Under upgradation Program of the Company, purchaser has wide choice of upgradation of services which can be availed by the Purchaser and the payment for upgradation shall be decided and determined on the basis of Services choose by the Purchaser and in accordance with the Company rules of membership service which may increase as per market inflation. The upgradation fee shall be payable on demand in advance.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>4. Responsibilities and termination</Text>
          <Text style={styles.text}>4.1 The Service Provider will use commercially reasonable efforts to provide services in a professional and timely manner. 4.2 The Client will provide all necessary materials, approvals, and access required for the Service Provider to fulfil their obligations.</Text>
          <Text style={styles.text}>4.3 In the event of purchaser(s) failing to make payment, of service fee/ membership fee or upgradation charges as applicable according to the agreement, within 7 days of being given a written notice to that effect by the Company or its representative being the essence, then this constitute a default under this agreement and all monies paid by the purchaser(s) shall be forfeited by the Company and at the Company's option this agreement may then be rescinded and the Company shall not be under any further liability to the Purchaser(s).</Text>
          <Text style={styles.text}>4.4 In case of Instalment/ upgradation plan, if the purchasers) makes default in payment of two instalments' ECS then Contract/Agreement shall stand rescinded and the amount paid by the purchaser(s) shall be forfeited</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>5. Intellectual Property and Right to Transfer</Text>
          <Text style={styles.text}>5.1 All pre-existing intellectual property of either party remains he property of thatparty. 5.2 Upon full payment, the Client shall own the final deliverables, unless otherwise specified in Schedule A. 5.3 The Service Provider retains the right to showcase the work as part of its portfolio, unless the Client requests otherwise in writing.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>6. Confidentiality</Text>
          <Text style={styles.text}>Both parties agree to maintain the confidentiality of any proprietary or confidential information disclosed during the course of the engagement and to not disclose such information to any third party without prior written consent.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>7. Limitation of Liability</Text>
          <Text style={styles.text}>To the maximum extent permitted by law, neither party shall be liable to the other for any indirect, incidental, or consequential damages arising out of or relating to this Agreement.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>8. Governing Law</Text>
          <Text style={styles.text}>As the present agreements is signed in Delhi, India this Agreement shall be governed by and construed in accordance with the laws of the Delhi state and any conflict shall be of Delhi jurisdiction.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>9. Dispute Resolution and Legal Costs</Text>
          <Text style={styles.text}>Right to Transfer: The Company withholds the right to transfer and as such the membership /services of the Company as purchase by the Purchasers) cannot be transferred in any case. The Purchaser(s) cannot split/transfer/exchange/ gift his/her membership.</Text>
          <Text style={styles.text}>The applicant(s) shall be responsible for all legal and other costs on a full indemnity basis incurred by the Company in seeking to enforce this agreement in any Jurisdiction arising out of any breach or non-observance or non-performance of any of the obligations on the part of the applicants)/ Purchaser herein contained.</Text>
          <Text style={styles.text}>Any disputes arising out of this Agreement shall be resolved through good faith negotiations. If unresolved, disputes shall be submitted to mediation or further be referred to arbitration through sole arbitrator having principal seat at Delhi.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>10. Entire Agreement</Text>
          <Text style={styles.text}>This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations or understandings. Modifications must be made in writing and signed by both parties.</Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={{ width: '45%' }}>
            <Text style={styles.signatureText}>INNODEM DIGITAL EXPORT PVT LTD.</Text>
          </View>
          <View style={{ width: '45%' }}>
            {data.signatureImage && (
              <Image
                src={data.signatureImage}
                style={{ height: 60, marginBottom: 5, objectFit: 'contain' }}
              />
            )}
            <Text style={styles.signatureText}>{data.clientName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const PDFAdminSideWrapper = ({ agreement, handleDownloadComplete, isViewing = false }) => {
  if (!agreement) {
    return <p>No agreement data available.</p>;
  }

  const agreementDocument = <AgreementPDF data={agreement} />;

  if (isViewing) {
    return (
      <div className="w-full h-[600px] border border-gray-300 rounded-md overflow-hidden">
        <PDFViewer className="w-full h-full">
          {agreementDocument}
        </PDFViewer>
      </div>
    );
  }

  return (
    <PDFDownloadLink
      document={agreementDocument}
      fileName={`service-agreement-${agreement._id?.substring(0, 5)}-admin.pdf`}
      onClick={() => handleDownloadComplete(agreement._id)}
    >
      {/* {({ loading }) => (
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md" disabled={loading}>
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      )} */}
    </PDFDownloadLink>
  );
};

export default PDFAdminSideWrapper;
