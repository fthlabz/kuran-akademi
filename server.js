import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();app.disable("x-powered-by");app.use(express.json({limit:"40kb"}));app.use(express.static(path.join(__dirname,"public")));
const PORT=process.env.PORT||3000, MODEL=process.env.OPENAI_MODEL||"gpt-6-luna";
const headings=[
"Arapça Orijinal Metin",
"Temel Meal ve Lafzî (Kelime Kelime) Çeviri",
"Morfolojik (Sarf) ve Nahiv (Sentaktik) Analizi",
"Etimoloji ve Câhiliye Dönemi Kullanımı",
"Kur’an İçi Kök ve Kavram Ağı",
"Nüzul Kronolojisi (İniş Sırasına Göre Kavram Analizi)",
"Esbâb-ı Nüzûl ve Tarihsel Bağlam",
"Siyak ve Sibak (Bağlam Analizi)",
"Kur’an’ın Kur’an’la Tefsiri (Tematik Çapraz Okuma)",
"Belâgat ve Edebî Analiz",
"Ontolojik, Ahlaki ve Hukuki Çıkarımlar",
"İşârî ve Tasavvufi Yorum (Ledünni Mana)",
"Semantik Karşıtlık ve Kavramsal Çiftler Analizi: Tıbâk, Mukâbele, Mesânî",
"Ayetin özü olan kelimenin lehçe, kök, İslam öncesi kullanılışı, mastarı, grameri"
];
app.get("/api/health",(_q,r)=>r.json({ok:true,configured:Boolean(process.env.OPENAI_API_KEY),model:MODEL}));
app.post("/api/analyze",async(req,res)=>{
 const verse=String(req.body?.verse||"").trim();
 if(!verse)return res.status(400).json({error:"Sure/ayet numarası veya Arapça metin girin."});
 if(verse.length>12000)return res.status(400).json({error:"Girdi 12.000 karakteri aşamaz."});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:"OPENAI_API_KEY eksik. Render → Environment bölümüne API anahtarını ekleyin."});
 const instructions=`Sen Kur’an metni üzerine çalışan titiz, kaynak bilincine sahip akademik araştırma asistanısın. Türkçe cevap ver. Aşağıdaki 14 başlığı tam bu sırayla, her birini ayrı Markdown H2 başlığı olarak kullanarak işle:
${headings.map((h,i)=>"## "+(i+1)+". "+h).join("\n")}
YÖNTEM:
- Her başlık altında kapsamlı, anlaşılır, akademik Türkçe kullan. Gereksiz tekrar ve yüzeysel maddelerden kaçın.
- Arapça metni veya referansı emin olmadıkça uydurma; belirsizse netleştirme iste.
- Kelime analizinde biçim, kök, vezin, tür, i‘rab/görev ve bağlam anlamını ayır.
- Câhiliye, lehçe, nüzul kronolojisi ve esbâb-ı nüzûlde kesin olmayanı kesin sunma.
- Kaynağa erişimin yoksa kaynak adı, cilt, sayfa, hadis numarası veya alıntı uydurma.
- Kur’an içi çapraz okumada ayet referanslarını sure ve ayet numarasıyla ver; alaka biçimini açıkla.
- 13. maddede Tıbâk (kelime zıtlığı), Mukâbele (cümle zıtlığı), Mesânî (kavramsal/ikili karşıtlık incelemesi) ayrımını yap; Mesânî yorumunu klasik belâgat terimiyle özdeşleştirme.
- 12. maddede işârî yorumu dilsel/bağlamsal temel anlamdan açıkça ayır.
- 14. maddede ayetin anahtar kelimesini seç; lehçe, kök, İslam öncesi kullanım, mastar ve grameri ayrı incele.
- Veri, rivayet, yorum ve kendi çıkarımını birbirinden ayır.
- Sonunda ## Kaynaklar ve doğrulama notu başlığı aç. Yalnızca gerçekten dayandığın kaynakları yaz; kontrol edemediğin bibliyografik bilgileri uydurma ve ayrıca doğrulanması gerekenleri belirt.
- Harici akademik veri tabanına erişimin yoksa bunu dürüstçe bildir. Akademik görüş ayrılıklarını görünür kıl.
- Biçim: kısa paragraflar, alt başlıklar, gerektiğinde tablolar ve **önemli terimler**. Düz metin yığını oluşturma.`;
 try{
  const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const out=await client.responses.create({model:MODEL,instructions,input:"Şu ayeti 14 başlıklı çerçeveyle çözümle: "+verse,max_output_tokens:12000});
  res.json({answer:out.output_text||"Yanıt üretilemedi.",model:MODEL});
 }catch(e){
  const status=e?.status||0,code=e?.code||e?.error?.code||"";
  console.error("OpenAI API failure",{status,code,message:e?.message});
  let message="OpenAI isteği başarısız oldu.";
  if(status===401)message="API anahtarı geçersiz veya iptal edilmiş. Render Environment bölümündeki OPENAI_API_KEY değerini kontrol edin.";
  else if(status===429)message="OpenAI kullanım kotası veya hız sınırı aşıldı. Platform.openai.com → Billing ve Limits bölümlerini kontrol edin.";
  else if(status===404||code==="model_not_found")message="Seçilen model hesabınızda kullanılamıyor. OPENAI_MODEL değerini ve model erişimini kontrol edin.";
  else if(status===400)message="OpenAI isteği reddetti. Model adı veya istek biçimi geçersiz olabilir.";
  else if(status===403)message="OpenAI API erişimi bu hesap için yetkilendirilmemiş.";
  else if(status===500||status===502||status===503)message="OpenAI tarafında geçici servis hatası oluştu. Biraz sonra yeniden deneyin.";
  res.status(502).json({error:message,diagnostic:{status:status||"bağlantı",code:code||"ayrıntı sunucuda kayıtlı"}});
 }
});
app.listen(PORT,()=>console.log("Kuran Akademi running on "+PORT+" | model="+MODEL));