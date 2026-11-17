import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();app.disable("x-powered-by");app.use(express.json({limit:"40kb"}));app.use(express.static(path.join(__dirname,"public")));
const PORT=process.env.PORT||3000, MODEL=process.env.OPENAI_MODEL||"gpt-6-luna";
const headings=["Arapça Orijinal Metin","Temel Meal ve Lafzî (Kelime Kelime) Çeviri","Morfolojik (Sarf) ve Nahiv (Sentaktik) Analizi","Etimoloji ve Câhiliye Dönemi Kullanımı","Kur’an İçi Kök ve Kavram Ağı","Nüzul Kronolojisi (İniş Sırasına Göre Kavram Analizi)","Esbâb-ı Nüzûl ve Tarihsel Bağlam","Siyak ve Sibak (Bağlam Analizi)","Kur’an’ın Kur’an’la Tefsiri (Tematik Çapraz Okuma)","Belâgat ve Edebî Analiz","Ontolojik, Ahlaki ve Hukuki Çıkarımlar","İşârî ve Tasavvufi Yorum (Ledünni Mana)","Semantik Karşıtlık ve Kavramsal Çiftler Analizi: Tıbâk, Mukâbele, Mesânî","Ayetin özü olan kelimenin lehçe, kök, İslam öncesi kullanılışı, mastarı ve grameri"];
app.get("/api/health",(_q,r)=>r.json({ok:true,configured:Boolean(process.env.OPENAI_API_KEY),model:MODEL}));
app.post("/api/analyze",async(req,res)=>{const verse=String(req.body?.verse||"").trim();if(!verse)return res.status(400).json({error:"Sure/ayet numarası veya Arapça metin girin."});if(verse.length>12000)return res.status(400).json({error:"Girdi 12.000 karakteri aşamaz."});if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:"Araştırma motoru henüz etkinleştirilmedi. OpenAI API anahtarı Render ortam değişkenlerine eklenmeli."});
const instructions=`Sen Kur’an metni üzerine çalışan titiz, kaynak bilincine sahip akademik araştırma asistanısın. Türkçe cevap ver. Kullanıcının zorunlu 14 başlıklı çerçevesi ve sırası:
${headings.map((h,i)=>(i+1)+". "+h).join("\n")}
YÖNTEM:
- Hiçbir başlığı atlama; veri yetersizse bunu açıkça belirt.
- Arapça metni veya referansı emin olmadıkça uydurma; gerekiyorsa netleştirme iste.
- Kelime analizinde biçim, kök, vezin, tür, i‘rab/görev ve bağlam anlamını ayır.
- Câhiliye, lehçe, nüzul kronolojisi ve esbâb-ı nüzûlde kesin olmayanı kesin sunma.
- Kaynağa erişimin yoksa kaynak adı, cilt, sayfa, hadis numarası veya alıntı uydurma.
- Kur’an içi çapraz okumada emin olduğun ayet referanslarını ver.
- 13. maddede Tıbâk (kelime), Mukâbele (cümle), Mesânî (kavramsal çiftler) ayrımını açıkla; Mesânî yorumunu klasik retorik terimle özdeşleştirme.
- 12. maddede işârî yorumu dilsel/bağlamsal temel anlamdan ayır.
- 14. maddede anahtar kelimeyi seç; lehçe, kök, İslam öncesi kullanım, mastar ve grameri ayrı incele.
- Sonunda “Kaynak ve doğrulama notu” ekle. Gerçekten dayandığın kaynakları ve henüz kontrol edilmesi gereken kaynakları ayrı listele.
- Harici akademik veri tabanına erişimin yoksa bunu belirt; akademik görüş ayrılıklarını ve veri/rivayet/yorum/çıkarım ayrımını göster.`;
try{const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});const out=await client.responses.create({model:MODEL,instructions,input:"Şu ayeti 14 başlıklı çerçeveyle çözümle: "+verse,max_output_tokens:9000});res.json({answer:out.output_text||"Yanıt üretilemedi.",model:MODEL});}catch(e){console.error("OpenAI error",e?.message||e);res.status(502).json({error:"Analiz tamamlanamadı. API anahtarını, model erişimini ve kullanım limitini kontrol edin."});}});

app.listen(PORT,()=>console.log("Kur’an Akademi listening on "+PORT+" model="+MODEL));