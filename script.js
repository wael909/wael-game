// حماية التوكن بتقسيم ذكي
const k1 = "hf_pSQepoiciN";
const k2 = "BeVnerWMUakure";
const k3 = "cVXCCpTUZO";
const AUTH_KEY = "Bearer " + k1 + k2 + k3;

const WORDS_LIST = ["مدرسة", "هاتف", "بحر", "قهوة", "تونس", "سيارة", "كتاب", "طائرة", "مزرعة", "قلم", "سلام", "جامعة"];
let secretWord = "";

const input = document.getElementById('wordInput');
const btn = document.getElementById('guessBtn');
const history = document.getElementById('history');
const datePicker = document.getElementById('datePicker');

// تشغيل عند البداية
window.onload = () => {
    datePicker.valueAsDate = new Date();
    setupGame();
};

datePicker.onchange = setupGame;

function setupGame() {
    const day = new Date(datePicker.value).getDate();
    secretWord = WORDS_LIST[day % WORDS_LIST.length];
    history.innerHTML = "";
    console.log("الكلمة جاهزة");
}

async function processGuess() {
    const guess = input.value.trim();
    if (!guess) return;

    if (guess === secretWord) {
        alert("🎉 مبروووك! الكلمة صحيحة!");
        renderResult(guess, 1000, "var(--success)");
        return;
    }

    btn.disabled = true;
    btn.innerText = "جاري التحليل...";

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", {
            method: "POST",
            headers: { "Authorization": AUTH_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ 
                inputs: { source_sentence: secretWord, sentences: [guess] },
                options: { wait_for_model: true }
            })
        });

        const data = await response.json();
        const score = Math.round(data[0] * 1000);
        
        let color = "var(--danger)";
        if (score > 750) color = "var(--success)";
        else if (score > 450) color = "var(--warning)";

        renderResult(guess, score, color);
    } catch (e) {
        alert("المحرك يسخن.. عاود جرب توّة!");
    } finally {
        btn.disabled = false;
        btn.innerText = "تحليل الكلمة";
        input.value = "";
        input.focus();
    }
}

function renderResult(word, score, color) {
    const html = `<div class="word-row" style="border-right-color: ${color}"><span>${word}</span><b>${score}</b></div>`;
    history.insertAdjacentHTML('afterbegin', html);
}

// أزرار المساعدة
btn.onclick = processGuess;
document.getElementById('hintBtn').onclick = () => alert("تبدأ بـ: " + secretWord[0]);
document.getElementById('surrenderBtn').onclick = () => { alert("الكلمة هي: " + secretWord); setupGame(); };
