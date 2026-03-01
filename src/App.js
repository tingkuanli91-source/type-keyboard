import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VOCABULARY } from './Vocabulary';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const LEVELS = [
  { name: '🌟 入門', time: 60, minLen: 2, maxLen: 4 },
  { name: '⭐ 初級', time: 90, minLen: 3, maxLen: 5 },
  { name: '🔥 中級', time: 120, minLen: 4, maxLen: 7 },
  { name: '💎 高級', time: 180, minLen: 5, maxLen: 10 },
];

function App() {
  const [gameState, setGameState] = useState('menu');
  const [level, setLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [currentWordObj, setCurrentWordObj] = useState({ en: '', zh: '' });
  const [typedLetters, setTypedLetters] = useState([]);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [correctKey, setCorrectKey] = useState(null);
  const [wrongKey, setWrongKey] = useState(null);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('typingHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const intervalRef = useRef(null);

  const getFilteredWords = useCallback(() => {
    const { minLen, maxLen } = LEVELS[level];
    return VOCABULARY.filter(w => w.en.length >= minLen && w.en.length <= maxLen);
  }, [level]);

  const pickNewWord = useCallback(() => {
    const words = getFilteredWords();
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWordObj(words[randomIndex]);
    setTypedLetters([]);
  }, [getFilteredWords]);

  const startGame = (levelIndex) => {
    setLevel(levelIndex);
    setTimeLeft(LEVELS[levelIndex].time);
    setScore(0);
    setCorrectCount(0);
    setMistakes(0);
    setStreak(0);
    setGameState('playing');
    const words = VOCABULARY.filter(w => w.en.length >= LEVELS[levelIndex].minLen && w.en.length <= LEVELS[levelIndex].maxLen);
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWordObj(words[randomIndex]);
  };

  const endGame = () => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('typingHighScore', score.toString());
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [gameState, timeLeft]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      const key = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(key)) return;
      const currentIndex = typedLetters.length;
      const targetLetter = currentWordObj.en[currentIndex];
      if (key === targetLetter) {
        setCorrectKey(key);
        setTimeout(() => setCorrectKey(null), 150);
        const newTyped = [...typedLetters, key];
        setTypedLetters(newTyped);
        const baseScore = 10;
        const streakBonus = Math.min(streak * 2, 20);
        setScore(prev => prev + baseScore + streakBonus);
        setCorrectCount(prev => prev + 1);
        setStreak(prev => prev + 1);
        if (newTyped.length === currentWordObj.en.length) setTimeout(pickNewWord, 200);
      } else {
        setWrongKey(key);
        setTimeout(() => setWrongKey(null), 150);
        setMistakes(prev => prev + 1);
        setStreak(0);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentWordObj, typedLetters, streak, pickNewWord]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const renderKeyboard = () => KEYBOARD_ROWS.map((row, rowIndex) => (
    <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
      {row.map((key) => {
        const isCorrect = correctKey === key;
        const isWrong = wrongKey === key;
        const isNext = currentWordObj.en[typedLetters.length] === key;
        let bgColor = '#fff', textColor = '#333', shadow = '0 3px 0 #999';
        if (isCorrect) { bgColor = '#4CAF50'; textColor = '#fff'; shadow = '0 3px 0 #2E7D32'; }
        else if (isWrong) { bgColor = '#f44336'; textColor = '#fff'; shadow = '0 3px 0 #C62828'; }
        else if (isNext) { bgColor = '#FF9800'; textColor = '#fff'; shadow = '0 3px 0 #EF6C00'; }
        return (
          <div key={key} style={{ width: '44px', height: '44px', margin: '3px', backgroundColor: bgColor, color: textColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', boxShadow: shadow, transition: 'all 0.1s' }}>
            {key}
          </div>
        );
      })}
    </div>
  ));

  if (gameState === 'menu') {
    return (
      <div style={styles.container}>
        <div style={styles.menu}>
          <h1 style={styles.title}>⌨️ 打字大挑戰</h1>
          <p style={styles.subtitle}>快來挑戰你的打字速度！</p>
          <div style={styles.highScore}>🏆 最高分: {highScore}</div>
          <div style={styles.levelList}>
            {LEVELS.map((lvl, index) => (
              <button key={index} style={styles.levelButton} onClick={() => startGame(index)}>
                <span style={styles.levelName}>{lvl.name}</span>
                <span style={styles.levelTime}>⏱️ {lvl.time}秒</span>
              </button>
            ))}
          </div>
          <label style={styles.checkbox}>
            <input type="checkbox" checked={showKeyboard} onChange={(e) => setShowKeyboard(e.target.checked)} />
            顯示鍵盤
          </label>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => setGameState('menu')}>❌ 離開</button>
        <div style={styles.levelBadge}>{LEVELS[level].name}</div>
        <div style={styles.timerBadge}>⏱️ {formatTime(timeLeft)}</div>
      </div>
      <div style={styles.scoreArea}>
        <div style={styles.scoreItem}><div style={styles.scoreNumber}>{score}</div><div style={styles.scoreLabel}>分數</div></div>
        <div style={styles.scoreItem}><div style={styles.scoreNumber}>{correctCount}</div><div style={styles.scoreLabel}>正確</div></div>
        <div style={styles.scoreItem}><div style={{...styles.scoreNumber, color: mistakes > 5 ? '#f44336' : '#fff'}}>{mistakes}</div><div style={styles.scoreLabel}>錯誤</div></div>
        <div style={styles.scoreItem}><div style={{...styles.scoreNumber, color: '#FF9800'}}>🔥 {streak}</div><div style={styles.scoreLabel}>連續</div></div>
      </div>
      <div style={styles.wordArea}>
        <div style={styles.chineseMeaning}>{currentWordObj.zh}</div>
        {currentWordObj.en.split('').map((letter, index) => (
          <span key={index} style={{
            ...styles.letter,
            color: index < typedLetters.length ? (typedLetters[index] === letter ? '#4CAF50' : '#f44336') : index === typedLetters.length ? '#FF9800' : '#fff',
            backgroundColor: index < typedLetters.length ? (typedLetters[index] === letter ? '#E8F5E9' : '#FFEBEE') : index === typedLetters.length ? '#FFF3E0' : 'transparent',
          }}>{letter}</span>
        ))}
      </div>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${(timeLeft / LEVELS[level].time) * 100}%`, backgroundColor: timeLeft < 10 ? '#f44336' : timeLeft < 30 ? '#FF9800' : '#4CAF50' }} />
      </div>
      {showKeyboard && <div style={styles.keyboard}>{renderKeyboard()}</div>}
      <div style={styles.hint}>按下鍵盤上的字母開始打字！</div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1a1a2e', fontFamily: "'Microsoft JhengHei', Arial, sans-serif", padding: '20px', color: '#fff' },
  menu: { maxWidth: '500px', margin: '60px auto', textAlign: 'center', backgroundColor: '#16213e', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' },
  title: { fontSize: '36px', marginBottom: '10px', color: '#e94560' },
  subtitle: { fontSize: '16px', color: '#aaa', marginBottom: '20px' },
  highScore: { fontSize: '20px', color: '#FFD700', marginBottom: '25px', padding: '10px', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '10px' },
  levelList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  levelButton: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#0f3460', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '18px', cursor: 'pointer' },
  levelName: { fontWeight: 'bold' },
  levelTime: { color: '#aaa', fontSize: '14px' },
  checkbox: { display: 'block', marginTop: '20px', color: '#aaa', cursor: 'pointer' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#e94560', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
  levelBadge: { padding: '8px 16px', backgroundColor: '#0f3460', borderRadius: '20px', fontSize: '16px' },
  timerBadge: { padding: '8px 16px', backgroundColor: '#0f3460', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold' },
  scoreArea: { display: 'flex', justifyContent: 'space-around', marginBottom: '30px' },
  scoreItem: { textAlign: 'center' },
  scoreNumber: { fontSize: '32px', fontWeight: 'bold' },
  scoreLabel: { fontSize: '14px', color: '#aaa' },
  wordArea: { textAlign: 'center', marginBottom: '30px', minHeight: '80px' },
  chineseMeaning: { fontSize: '28px', color: '#FFD700', marginBottom: '15px', fontWeight: 'bold' },
  letter: { display: 'inline-block', fontSize: '48px', fontWeight: 'bold', padding: '8px 12px', margin: '0 4px', borderRadius: '8px', transition: 'all 0.15s' },
  progressBar: { height: '8px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '25px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 1s linear' },
  keyboard: { marginBottom: '20px' },
  hint: { textAlign: 'center', color: '#666', fontSize: '14px' },
};

export default App;
