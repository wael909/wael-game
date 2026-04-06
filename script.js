const p1 = "hf_pSQepoiciN";
const p2 = "BeVnerWMUakure";
const p3 = "cVXCCpTUZO";
const KEY = "Bearer " + p1 + p2 + p3;

const SECRETS = ["مدرسة", "هاتف", "بحر", "قهوة", "تونس", "سيارة", "كتاب", "طائرة", "مزرعة", "قلم"];
let currentWord = "";

window.onload = () => {
    document.getElementById('datePicker').valueAsDate = new Date();
    loadGame();
};

function closeModal() {
    document.getElementById('howToPlay').style.display = 'none';
}

function loadGame() {
    const day = new Date(document.getElementById('datePicker').value).getDate();
    currentWord = SECRETS[day % SECRETS.length];
    document.getElementById('history').innerHTML = "";
}

async function play() {
    const input = document.getElementById('wordInput');
    const guess = input.value.trim();
    if (!guess) return;

    if (guess === currentWord) {
        alert("🎉 مبروك! الكلمة صحيحة!");
        addResult(guess, 1000, "#22c55e");
        return;
    }

    const btn = document.getElementById('guessBtn');
    btn.innerText = "جاري التحليل...";
    btn.disabled = true;

    try {
        const res = await fetch("https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", {
            method: "POST",
            headers: { "Authorization": KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: { source_sentence: currentWord, sentences: [guess] }, options: { wait_for_model: true } })
        });
        const data = await res.json();
        const score = Math.round(data[0] * 1000);
        
        let color = "#ef4444";
        if (score > 700) color = "#22c55e";
        else if (score > 400) color = "#f59e0b";

        addResult(guess, score, color);
    } catch (e) {
        alert("المحرك يسخن.. عاود جرب!");
    } finally {
        btn.innerText = "تحليل";
        btn.disabled = false;
        input.value = "";
    }
}

function addResult(w, s, c) {
    const row = `<div class="word-row" style="border-right-color: ${c}"><span>${w}</span><b>${s}</b></div>`;
    document.getElementById('history').insertAdjacentHTML('afterbegin', row);
}

document.getElementById('guessBtn').onclick = play;
document.getElementById('datePicker').onchange = loadGame;
document.getElementById('hintBtn').onclick = () => alert("تبدأ بحرف: " + currentWord[0]);
document.getElementById('surrenderBtn').onclick = () => { alert("الكلمة هي: " + currentWord); loadGame(); };
