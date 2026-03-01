import React, { useState, useEffect, useCallback, useRef } from 'react';

// 鍵盤配置
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

// 遊戲等級
const LEVELS = [
  { name: '🌟 入門', time: 60, words: ['CAT', 'DOG', 'SUN', 'BAT', 'PIG', 'COW', 'FOX', 'OWL', 'HAT', 'RAT'] },
  { name: '⭐ 初級', time: 90, words: ['APPLE', 'BANANA', 'LEMON', 'GRAPE', 'HOUSE', 'TREE', 'WATER', 'BOOK', 'FISH', 'BIRD'] },
  { name: '🔥 中級', time: 120, words: ['FAMILY', 'FRIEND', 'HAPPY', 'ORANGE', 'PURPLE', 'MANGO', 'FLOWER', 'RIVER', 'WINDOW', 'CHAIR'] },
  { name: '💎 高級', time: 180, words: ['COMPUTER', 'KEYBOARD', 'MOUNTAIN', 'LIBRARY', 'TEACHER', 'PLAYGROUND', 'FANTASTIC', 'BEAUTIFUL', 'WONDERFUL', 'ADVENTURE'] },
];

// 單字列表（分難度）
const ALL_WORDS = {
  easy: ['CAT', 'DOG', 'SUN', 'HAT', 'BAT', 'RAT', 'PIG', 'COW', 'FOX', 'OWL', 'BUS', 'CAR', 'BUS', 'VAN'],
  medium: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'MANGO', 'HOUSE', 'TREE', 'WATER', 'FISH', 'BIRD', 'LION', 'BEAR'],
  hard: ['FAMILY', 'FRIEND', 'HAPPY', 'ORANGE', 'PURPLE', 'FLOWER', 'RIVER', 'WINDOW', 'CHAIR', 'TABLE', 'PHONE', 'MUSIC'],
};

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
  const [level, setLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [typedLetters, setTypedLetters] = useState([]);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [correctKey, setCorrectKey] = useState(null);
  const [wrongKey, setWrongKey] = useState(null);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const intervalRef = useRef(null);

  // 取得當前等級的單字
  const getWords = useCallback(() => {
    return LEVELS[level].words;
  }, [level]);

  // 隨機選擇單字
  const pickNewWord = useCallback(() => {
    const words = getWords();
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWord(words[randomIndex]);
    setTypedLetters([]);
  }, [getWords]);

  // 開始遊戲
  const startGame = (levelIndex) => {
    setLevel(levelIndex);
    setTimeLeft(LEVELS[levelIndex].time);
    setScore(0);
    setCorrectCount(0);
    setMistakes(0);
    setStreak(0);
    setGameState('playing');
    pickNewWord();
  };

  // 結束遊戲
  const endGame = () => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
  };

  // 計時器
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState, timeLeft]);

  // 鍵盤輸入處理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      const key = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(key)) return;

      const currentIndex = typedLetters.length;

      if (key === currentWord[currentIndex]) {
        setCorrectKey(key);
        setTimeout(() => setCorrectKey(null), 150);

        const newTyped = [...typedLetters, key];
        setTypedLetters(newTyped);

        // 計算得分
        const baseScore = 10;
        const streakBonus = Math.min(streak * 2, 20);
        setScore((prev) => prev + baseScore + streakBonus);
        setCorrectCount((prev) => prev + 1);
        setStreak((prev) => prev + 1);

        if (newTyped.length === currentWord.length) {
          setTimeout(pickNewWord, 200);
        }
      } else {
        setWrongKey(key);
        setTimeout(() => setWrongKey(null), 150);
        setMistakes((prev) => prev + 1);
        setStreak(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentWord, typedLetters, streak, pickNewWord]);

  // 格式化時間
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 渲染鍵盤
  const renderKeyboard = () => {
    return KEYBOARD_ROWS.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
        {row.map((key) => {
          const isCorrect = correctKey === key;
          const isWrong = wrongKey === key;
          const isNext = currentWord[typedLetters.length] === key;

          let bgColor = '#fff';
          let textColor = '#333';
          let shadow = '0 3px 0 #999';

          if (isCorrect) {
            bgColor = '#4CAF50';
            textColor = '#fff';
            shadow = '0 3px 0 #2E7D32';
          } else if (isWrong) {
            bgColor = '#f44336';
            textColor = '#fff';
            shadow = '0 3px 0 #C62828';
          } else if (isNext) {
            bgColor = '#FF9800';
            textColor = '#fff';
            shadow = '0 3px 0 #EF6C00';
          }

          return (
            <div
              key={key}
              style={{
                width: '44px',
                height: '44px',
                margin: '3px',
                backgroundColor: bgColor,
                color: textColor,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: shadow,
                transition: 'all 0.1s',
              }}
            >
              {key}
            </div>
          );
        })}
      </div>
    ));
  };

  // 選單選單
  if (gameState === 'menu') {
    return (
      <div style={styles.container}>
        <div style={styles.menu}>
          <h1 style={styles.title}>⌨️ 打字大挑戰</h1>
          <p style={styles.subtitle}>快來挑戰你的打字速度！</p>

          <div style={styles.highScore}>🏆 最高分: {highScore}</div>

          <div style={styles.levelList}>
            {LEVELS.map((lvl, index) => (
              <button
                key={index}
                style={styles.levelButton}
                onClick={() => startGame(index)}
              >
                <span style={styles.levelName}>{lvl.name}</span>
                <span style={styles.levelTime}>⏱️ {lvl.time}秒</span>
              </button>
            ))}
          </div>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={showKeyboard}
              onChange={(e) => setShowKeyboard(e.target.checked)}
            />
            顯示鍵盤
          </label>
        </div>
      </div>
    );
  }

  // 遊戲進行中
  return (
    <div style={styles.container}>
      {/* 頂部資訊 */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => setGameState('menu')}>❌ 離開</button>
        <div style={styles.levelBadge}>{LEVELS[level].name}</div>
        <div style={styles.timerBadge}>⏱️ {formatTime(timeLeft)}</div>
      </div>

      {/* 分數區 */}
      <div style={styles.scoreArea}>
        <div style={styles.scoreItem}>
          <div style={styles.scoreNumber}>{score}</div>
          <div style={styles.scoreLabel}>分數</div>
        </div>
        <div style={styles.scoreItem}>
          <div style={styles.scoreNumber}>{correctCount}</div>
          <div style={styles.scoreLabel}>正確</div>
        </div>
        <div style={styles.scoreItem}>
          <div style={styles.scoreNumber} style={{ color: mistakes > 5 ? '#f44336' : '#333' }}>{mistakes}</div>
          <div style={styles.scoreLabel}>錯誤</div>
        </div>
        <div style={styles.scoreItem}>
          <div style={styles.scoreNumber} style={{ color: '#FF9800' }}>🔥 {streak}</div>
          <div style={styles.scoreLabel}>連續</div>
        </div>
      </div>

      {/* 目標單字 */}
      <div style={styles.wordArea}>
        {currentWord.split('').map((letter, index) => (
          <span
            key={index}
            style={{
              ...styles.letter,
              color: index < typedLetters.length
                ? (typedLetters[index] === letter ? '#4CAF50' : '#f44336')
                : index === typedLetters.length ? '#FF9800' : '#333',
              backgroundColor: index < typedLetters.length
                ? (typedLetters[index] === letter ? '#E8F5E9' : '#FFEBEE')
                : index === typedLetters.length ? '#FFF3E0' : 'transparent',
              transform: index < typedLetters.length ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* 進度條 */}
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${(timeLeft / LEVELS[level].time) * 100}%`,
            backgroundColor: timeLeft < 10 ? '#f44336' : timeLeft < 30 ? '#FF9800' : '#4CAF50',
          }}
        />
      </div>

      {/* 鍵盤 */}
      {showKeyboard && <div style={styles.keyboard}>{renderKeyboard()}</div>}

      {/* 提示 */}
      <div style={styles.hint}>按下鍵盤上的字母開始打字！</div>
    </div>
  );
}

// 遊戲結束畫面
function GameOver({ score, correctCount, mistakes, highScore, onRestart, onMenu }) {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div style={styles.container}>
      <div style={styles.gameOver}>
        <h1 style={styles.gameOverTitle}>🎮 遊戲結束！</h1>

        {isNewHighScore && (
          <div style={styles.newHighScore}>🏆 新紀錄！</div>
        )}

        <div style={styles.finalScore}>
          <div style={styles.finalScoreNumber}>{score}</div>
          <div style={styles.finalScoreLabel}>總分數</div>
        </div>

        <div style={styles.stats}>
          <div style={styles.statRow}>
            <span>✅ 正確</span>
            <span>{correctCount}</span>
          </div>
          <div style={styles.statRow}>
            <span>❌ 錯誤</span>
            <span>{mistakes}</span>
          </div>
          <div style={styles.statRow}>
            <span>📊 正確率</span>
            <span>{correctCount + mistakes > 0 ? Math.round((correctCount / (correctCount + mistakes)) * 100) : 0}%</span>
          </div>
        </div>

        <div style={styles.highScoreSmall}>🏆 最高分: {highScore}</div>

        <button style={styles.restartBtn} onClick={onRestart}>
          🔄 再玩一次
        </button>

        <button style={styles.menuBtn} onClick={onMenu}>
          🏠 回到選單
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a2e',
    fontFamily: "'Microsoft JhengHei', Arial, sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
    color: '#fff',
  },
  menu: {
    maxWidth: '500px',
    margin: '60px auto',
    textAlign: 'center',
    backgroundColor: '#16213e',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '36px',
    marginBottom: '10px',
    color: '#e94560',
  },
  subtitle: {
    fontSize: '16px',
    color: '#aaa',
    marginBottom: '20px',
  },
  highScore: {
    fontSize: '20px',
    color: '#FFD700',
    marginBottom: '25px',
    padding: '10px',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: '10px',
  },
  levelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  levelButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#0f3460',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'transform 0.2s, backgroundColor 0.2s',
  },
  levelName: {
    fontWeight: 'bold',
  },
  levelTime: {
    color: '#aaa',
    fontSize: '14px',
  },
  checkbox: {
    display: 'block',
    marginTop: '20px',
    color: '#aaa',
    cursor: 'pointer',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: '#e94560',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
  },
  levelBadge: {
    padding: '8px 16px',
    backgroundColor: '#0f3460',
    borderRadius: '20px',
    fontSize: '16px',
  },
  timerBadge: {
    padding: '8px 16px',
    backgroundColor: '#0f3460',
    borderRadius: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  scoreArea: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
  },
  scoreItem: {
    textAlign: 'center',
  },
  scoreNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: '14px',
    color: '#aaa',
  },
  wordArea: {
    textAlign: 'center',
    marginBottom: '30px',
    minHeight: '60px',
  },
  letter: {
    display: 'inline-block',
    fontSize: '48px',
    fontWeight: 'bold',
    padding: '8px 12px',
    margin: '0 4px',
    borderRadius: '8px',
    transition: 'all 0.15s',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#333',
    borderRadius: '4px',
    marginBottom: '25px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 1s linear',
  },
  keyboard: {
    marginBottom: '20px',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
  },
  gameOver: {
    maxWidth: '400px',
    margin: '100px auto',
    textAlign: 'center',
    backgroundColor: '#16213e',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  gameOverTitle: {
    fontSize: '32px',
    marginBottom: '20px',
    color: '#e94560',
  },
  newHighScore: {
    fontSize: '24px',
    color: '#FFD700',
    marginBottom: '20px',
    animation: 'pulse 1s infinite',
  },
  finalScore: {
    marginBottom: '25px',
  },
  finalScoreNumber: {
    fontSize: '64px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  finalScoreLabel: {
    fontSize: '16px',
    color: '#aaa',
  },
  stats: {
    backgroundColor: '#0f3460',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #333',
  },
  highScoreSmall: {
    color: '#FFD700',
    marginBottom: '25px',
  },
  restartBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  menuBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
  },
};

export default App;
