import React, { useState, useEffect, useCallback } from 'react';

// 鍵盤配置
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

// 英文單字列表（簡單的兒童單字）
const WORDS = [
  'CAT', 'DOG', 'SUN', 'HAT', 'BAT', 'RAT', 'PIG', 'COW', 'FOX', 'OWL',
  'APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'MANGO', 'LEMON', 'PEACH', 'MELON',
  'HOUSE', 'TREE', 'FLOWER', 'RIVER', 'MOUNTAIN', 'OCEAN', 'SKY', 'CLOUD',
  'BOOK', 'PENCIL', 'RULER', 'TABLE', 'CHAIR', 'WINDOW', 'DOOR', 'FLOOR',
  'RED', 'BLUE', 'GREEN', 'YELLOW', 'PINK', 'PURPLE', 'ORANGE', 'BLACK',
  'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
  'FISH', 'BIRD', 'LION', 'TIGER', 'BEAR', 'DUCK', 'FROG', 'MOUSE', 'SNAKE',
  'HAPPY', 'SAD', 'ANGRY', 'SCARED', 'TIRED', 'HUNGRY', 'THIRSTY', 'SLEEPY',
  'MOM', 'DAD', 'SISTER', 'BROTHER', 'GRANDMA', 'GRANDPA', 'FRIEND', 'TEACHER',
  'PLAY', 'RUN', 'JUMP', 'SWIM', 'SING', 'DANCE', 'READ', 'WRITE', 'DRAW'
];

function App() {
  const [currentWord, setCurrentWord] = useState('');
  const [typedLetters, setTypedLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState('word'); // 'word' or 'letter'
  const [currentLetter, setCurrentLetter] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [correctKey, setCorrectKey] = useState(null);
  const [wrongKey, setWrongKey] = useState(null);

  // 隨機選擇一個單字
  const pickNewWord = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    setCurrentWord(WORDS[randomIndex]);
    setTypedLetters([]);
  }, []);

  // 隨機選擇一個字母
  const pickNewLetter = useCallback(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomIndex = Math.floor(Math.random() * letters.length);
    setCurrentLetter(letters[randomIndex]);
    setTypedLetters([]);
  }, []);

  // 開始遊戲
  const startGame = (mode) => {
    setGameMode(mode);
    setGameStarted(true);
    setScore(0);
    setMistakes(0);
    setStreak(0);
    if (mode === 'word') {
      pickNewWord();
    } else {
      pickNewLetter();
    }
  };

  // 重置遊戲
  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setMistakes(0);
    setStreak(0);
    setTypedLetters([]);
    setCurrentWord('');
    setCurrentLetter('');
  };

  // 處理鍵盤輸入
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted) return;

      const key = e.key.toUpperCase();
      
      // 只處理字母鍵
      if (!/^[A-Z]$/.test(key)) return;

      const target = gameMode === 'word' ? currentWord : currentLetter;
      const currentIndex = typedLetters.length;

      // 動畫效果
      if (key === target[currentIndex]) {
        setCorrectKey(key);
        setTimeout(() => setCorrectKey(null), 200);
        
        const newTyped = [...typedLetters, key];
        setTypedLetters(newTyped);
        
        // 檢查是否完成
        if (newTyped.length === target.length) {
          setScore(score + target.length * 10);
          setStreak(streak + 1);
          
          // 短暫延遲後顯示下一個
          setTimeout(() => {
            if (gameMode === 'word') {
              pickNewWord();
            } else {
              pickNewLetter();
            }
          }, 300);
        }
      } else {
        setWrongKey(key);
        setTimeout(() => setWrongKey(null), 200);
        
        setMistakes(mistakes + 1);
        setStreak(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, currentWord, currentLetter, typedLetters, score, mistakes, streak, gameMode, pickNewWord, pickNewLetter]);

  // 渲染鍵盤
  const renderKeyboard = () => {
    return KEYBOARD_ROWS.map((row, rowIndex) => (
      <div key={rowIndex} className="keyboard-row" style={{ marginBottom: '8px' }}>
        {row.map((key) => {
          const isCorrect = correctKey === key;
          const isWrong = wrongKey === key;
          const isNext = gameMode === 'word' 
            ? currentWord[typedLetters.length] === key
            : currentLetter === key;
          
          return (
            <div
              key={key}
              className={`key ${isCorrect ? 'key-correct' : ''} ${isWrong ? 'key-wrong' : ''} ${isNext ? 'key-next' : ''}`}
              style={{
                display: 'inline-block',
                width: '50px',
                height: '50px',
                margin: '4px',
                backgroundColor: isCorrect ? '#4CAF50' : isWrong ? '#f44336' : isNext ? '#FF9800' : '#fff',
                borderRadius: '8px',
                border: '2px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: isCorrect || isWrong ? '#fff' : '#333',
                boxShadow: '0 4px 0 #333',
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

  // 遊戲結束畫面
  if (!gameStarted) {
    return (
      <div style={styles.container}>
        <div style={styles.menu}>
          <h1 style={styles.title}>⌨️ 鍵盤打字練習</h1>
          <p style={styles.subtitle}>一起來練習打字吧！</p>
          
          <button style={styles.menuButton} onClick={() => startGame('letter')}>
            🔤 字母練習
            <span style={styles.menuButtonSub}>從 A 打 Z，認識鍵盤</span>
          </button>
          
          <button style={styles.menuButton} onClick={() => startGame('word')}>
            📝 單字練習
            <span style={styles.menuButtonSub}>輸入簡單的英文單字</span>
          </button>
          
          <div style={styles.toggleContainer}>
            <label style={styles.toggleLabel}>
              <input 
                type="checkbox" 
                checked={showKeyboard} 
                onChange={(e) => setShowKeyboard(e.target.checked)}
                style={styles.toggle}
              />
              顯示鍵盤
            </label>
          </div>
        </div>
      </div>
    );
  }

  const target = gameMode === 'word' ? currentWord : currentLetter;

  return (
    <div style={styles.container}>
      {/* 頂部資訊 */}
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={resetGame}>⬅️ 重新開始</button>
        <div style={styles.stats}>
          <div style={styles.statItem}>⭐ {score}</div>
          <div style={styles.statItem}>🔥 {streak} 連續</div>
          <div style={styles.statItem}>❌ {mistakes} 錯誤</div>
        </div>
      </div>

      {/* 目標顯示 */}
      <div style={styles.targetContainer}>
        {gameMode === 'word' ? (
          <div style={styles.wordDisplay}>
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
                    : 'transparent',
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        ) : (
          <div style={styles.letterDisplay}>
            <span style={styles.bigLetter}>
              {currentLetter}
            </span>
          </div>
        )}
        
        <div style={styles.progress}>
          {typedLetters.length} / {target.length}
        </div>
      </div>

      {/* 虛擬鍵盤 */}
      {showKeyboard && (
        <div style={styles.keyboard}>
          {renderKeyboard()}
        </div>
      )}

      {/* 提示 */}
      <div style={styles.hint}>
        {gameMode === 'word' 
          ? '打出螢幕上的英文單字！' 
          : '找出鍵盤上的這個字母並按下！'}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    fontFamily: "'Microsoft JhengHei', Arial, sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
  },
  menu: {
    maxWidth: '500px',
    margin: '100px auto',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
  },
  menuButton: {
    display: 'block',
    width: '100%',
    padding: '20px',
    marginBottom: '15px',
    fontSize: '24px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 5px 0 #388E3C',
  },
  menuButtonSub: {
    display: 'block',
    fontSize: '14px',
    marginTop: '5px',
    opacity: 0.9,
  },
  toggleContainer: {
    marginTop: '20px',
  },
  toggleLabel: {
    fontSize: '16px',
    color: '#666',
    cursor: 'pointer',
  },
  toggle: {
    marginRight: '8px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#fff',
    border: '2px solid #333',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  stats: {
    display: 'flex',
    gap: '15px',
  },
  statItem: {
    padding: '8px 15px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  targetContainer: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  wordDisplay: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  letter: {
    display: 'inline-block',
    padding: '5px 10px',
    margin: '0 3px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  letterDisplay: {
    marginBottom: '20px',
  },
  bigLetter: {
    fontSize: '120px',
    fontWeight: 'bold',
    color: '#FF9800',
  },
  progress: {
    fontSize: '24px',
    color: '#666',
  },
  keyboard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  hint: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#666',
  },
};

export default App;
