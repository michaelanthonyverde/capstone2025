(function () {
  const DEFAULT_WORDS = [
    { term: "pithy", definition: "concise and forcefully expressive", partOfSpeech: "adj.", hint: "Short but powerful." },
    { term: "equivocate", definition: "to use ambiguous language to conceal the truth", partOfSpeech: "verb", hint: "Saying things without saying them." },
    { term: "abate", definition: "to become less intense or widespread", partOfSpeech: "verb", hint: "Storms calm down." },
    { term: "erudite", definition: "having or showing great knowledge", partOfSpeech: "adj.", hint: "Librarian vibes." },
    { term: "capricious", definition: "sudden and unaccountable changes of mood or behavior", partOfSpeech: "adj.", hint: "Whims on a dime." }
  ];

  const SOURCE = (window.WORDS && Array.isArray(window.WORDS) && window.WORDS.length) ? window.WORDS : DEFAULT_WORDS;

  const scoreEl = document.getElementById("score");
  const qEl = document.getElementById("question");
  const answersEl = document.getElementById("answers");
  const nextBtn = document.getElementById("nextBtn");

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const buildChoices = (correct, pool) => {
    const wrongs = shuffle(pool.filter((d) => d !== correct)).slice(0, 3);
    return shuffle([correct, ...wrongs]);
  };

  let questions = SOURCE.map((w) => ({
    prompt: `What is the best definition of "${w.term}" (${w.partOfSpeech})?`,
    correct: w.definition,
    hint: w.hint || "",
    choices: []
  }));

  const defs = SOURCE.map((w) => w.definition);
  questions.forEach((q) => (q.choices = buildChoices(q.correct, defs)));
  questions = shuffle(questions);

  let qIdx = 0;
  let score = 0;
  let locked = false;

  const updateScore = () => {
    scoreEl.textContent = `Score: ${score} / ${qIdx}`;
  };

  const renderQuestion = () => {
    locked = false;
    const q = questions[qIdx];
    qEl.textContent = q.prompt;
    answersEl.innerHTML = "";

    q.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice;
      btn.className = "btn";
      btn.style.display = "block";
      btn.style.margin = "8px 0";
      btn.onclick = () => handleAnswer(btn, choice === q.correct, q.hint);
      answersEl.appendChild(btn);
    });

    nextBtn.style.display = "none";
  };

  const handleAnswer = (button, isCorrect, hint) => {
    if (locked) return;
    locked = true;

    Array.from(answersEl.children).forEach((btn) => {
      const isRight = btn.textContent === questions[qIdx].correct;
      btn.style.border = isRight ? "2px solid #2aa84a" : "2px solid #cc3a3a";
      btn.disabled = true;
    });

    if (isCorrect) score++;
    qIdx++;
    updateScore();

    if (!isCorrect && hint) {
      const p = document.createElement("p");
      p.textContent = `Hint: ${hint}`;
      p.style.marginTop = "10px";
      answersEl.appendChild(p);
    }

    if (qIdx < questions.length) {
      nextBtn.textContent = "Next";
      nextBtn.style.display = "inline-block";
      nextBtn.onclick = renderQuestion;
    } else {
      nextBtn.textContent = "Finish";
      nextBtn.style.display = "inline-block";
      nextBtn.onclick = () => {
        qEl.textContent = "Quiz complete!";
        answersEl.innerHTML = `You scored ${score} out of ${questions.length}.`;
        nextBtn.style.display = "none";
      };
    }
  };

  updateScore();
  renderQuestion();
})();
