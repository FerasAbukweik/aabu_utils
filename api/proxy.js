export default async function handler(req, res) {
  // السماح بطلبات CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // استخراج المسار المطلوب
  const targetPath = req.query.path;
  if (!targetPath) {
    return res.status(400).send('Missing path parameter');
  }

  // بناء الرابط النهائي لسيرفر الجامعة
  const url = `https://web2.aabu.edu.jo${targetPath}`;

  try {
    // إعادة بناء البيانات المُرسلة (form-urlencoded) لأن Vercel يحولها إلى كائن (Object)
    let bodyString = '';
    if (typeof req.body === 'object') {
      bodyString = new URLSearchParams(req.body).toString();
    } else {
      bodyString = req.body;
    }

    // إرسال الطلب إلى سيرفر الجامعة
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' // إيهام السيرفر أن الطلب من متصفح
      },
      body: bodyString
    });

    // استلام رد الجامعة وإرساله لتطبيق Angular
    const data = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).send('Error proxying request');
  }
}