export const metadata = { title: 'Privacy Policy | Moving Forward Permitting Services' };
export default function Privacy() {
 const sections = [
 ['Who we are','Moving Forward Permitting Services is operated by Moving Forward Permitting Service LLC, Alabama, United States. Contact: movingforwardpermitting@gmail.com.'],
 ['Information we collect','When you submit an inquiry, we collect the contact, carrier, vehicle, permit, and travel information you provide. Our website and service providers may also process technical information needed for security and request handling.'],
 ['How we use information','We use information to review requests, prepare and obtain permits, communicate with you, arrange payment, maintain business records, prevent abuse, and comply with applicable legal requirements.'],
 ['Sharing','We may share information as needed with issuing agencies, permit-processing partners, and providers that support hosting, data storage, email, and payment processing. We may also disclose information when legally required.'],
 ['Payments','When a payment link is provided, payment information is processed by the payment provider under its own terms and privacy practices. Do not enter card details or passwords into the permit inquiry form.'],
 ['Security and retention','We use administrative and technical safeguards appropriate to the information handled, but no online system is completely secure. Information may be retained as necessary to fulfill orders, maintain records, resolve disputes, and meet legal obligations.'],
 ['Your questions','To request access, correction, or deletion of information, subject to applicable law and recordkeeping requirements, contact movingforwardpermitting@gmail.com.']
 ];
 return <main style={{fontFamily:'Arial,sans-serif',background:'#07111e',color:'#f8fafc',minHeight:'100vh',padding:'48px 24px'}}><article style={{maxWidth:820,margin:'auto',lineHeight:1.75}}><a style={{color:'#f5cf68'}} href="/">← Back to permit requests</a><h1>Privacy Policy</h1><p>Effective November 19, 2026</p>{sections.map(([title,body])=><section key={title}><h2>{title}</h2><p style={{color:'#c2cedd'}}>{body}</p></section>)}<p>© 2026 Moving Forward Permitting Services. Operated by Moving Forward Permitting Service LLC.</p></article></main>;
}