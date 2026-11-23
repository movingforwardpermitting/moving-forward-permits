export const metadata = {
  title: 'Cancellations & Refunds | Moving Forward Permitting Services',
  description: 'How to request cancellation or a refund of a reviewed trip or fuel permit order.'
};

const sections = [
  {
    heading: 'Before you pay',
    paragraphs: [
      'Submitting a permit inquiry does not create a charge or authorize us to buy a permit. We first confirm availability and provide a reviewed quote showing our service fee and any government or provider charges. You may decide not to proceed before paying.'
    ]
  },
  {
    heading: 'Requesting cancellation after payment',
    paragraphs: [
      'If you need to cancel or change a paid order, contact us as soon as possible at movingforwardpermitting@gmail.com. Include your order number, company name, and the state or permit involved. Do not send payment card details or passwords by email.',
      'We will review the order’s processing status and let you know whether a cancellation is still possible. Some permit applications may be submitted to an issuing agency soon after payment, particularly rush requests.'
    ]
  },
  {
    heading: 'Service fees and government or provider charges',
    paragraphs: [
      'Refund eligibility depends on the work already performed, the status of each permit application, the charges already incurred, the terms disclosed with your reviewed quote, and applicable law.',
      'Government agency and third-party processing charges may be nonrefundable after submission or issuance. We cannot promise a refund of funds that an issuing authority or provider does not return.'
    ]
  },
  {
    heading: 'If a permit cannot be obtained',
    paragraphs: [
      'If an agency rejects a request, a permit is unavailable, or we are unable to complete a paid service, we will review the circumstances, identify any recoverable fees, and communicate what refund or correction is available. State agencies make the final decision on permit approval and issuance.'
    ]
  },
  {
    heading: 'Problems with a charge or delivered permit',
    paragraphs: [
      'For an incorrect charge, duplicate payment, missing permit, or error in issued documents, email us with your order number and a description of the issue. We will investigate and explain the next steps. Your rights under applicable law are not limited by this page.'
    ]
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Email: movingforwardpermitting@gmail.com. Include your order number so we can locate your request.'
    ]
  }
];

export default function Refunds() {
  return <main style={{fontFamily:'Arial,sans-serif',background:'#07111e',color:'#f8fafc',minHeight:'100vh',padding:'48px 24px'}}>
    <article style={{maxWidth:820,margin:'auto',lineHeight:1.75}}>
      <a style={{color:'#f5cf68'}} href="/">← Back to permit requests</a>
      <h1>Cancellations &amp; Refunds</h1>
      <p style={{color:'#c2cedd'}}>Effective November 23, 2026</p>
      <p style={{color:'#c2cedd'}}>Moving Forward Permitting Services is a private permit-processing assistance business, not a government agency. This page explains how cancellation and refund requests are reviewed.</p>
      {sections.map(section=><section key={section.heading} style={{marginTop:24}}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map((paragraph,i)=><p key={i} style={{color:'#c2cedd'}}>{paragraph}</p>)}
      </section>)}
      <p style={{marginTop:32,color:'#c2cedd'}}>Also see our <a style={{color:'#f5cf68'}} href="/terms">Terms of Service</a> and <a style={{color:'#f5cf68'}} href="/privacy">Privacy Policy</a>.</p>
      <p style={{color:'#c2cedd'}}>© 2026 Moving Forward Permitting Services. Operated by Moving Forward Permitting Service LLC.</p>
    </article>
  </main>;
}
