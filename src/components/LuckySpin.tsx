import { useRef, useState } from "react";
import Confetti from "react-confetti";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style.scss";

export default function LuckySpin() {
  // Range vé số
  const MIN = 2004;
  const MAX = 4805;

  // Digits
  const [digits, setDigits] = useState<number[]>([2, 0, 0, 4]);

  // Trạng thái quay
  const [spinning, setSpinning] = useState(false);

  // Modal + Winner
  const [showModal, setShowModal] = useState(false);
  const [winnerNumber, setWinnerNumber] = useState("");

  // Confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Winner list
  const [winnerList, setWinnerList] = useState<string[]>([]);

  // Interval ref để chạy liên tục
  const spinInterval = useRef<any>(null);

  // Random digit
  const randomDigit = () => Math.floor(Math.random() * 10);

  // Random vé trong range
  const generateTicketNumber = () => {
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
  };

  // Sound ting
  const playSound = () => {
    const audio = new Audio("/ting.mp3");
    audio.play();
  };

  // Export Excel
  const exportExcel = () => {
    if (winnerList.length === 0) return;

    const data = winnerList.map((item, index) => ({
      STT: index + 1,
      "Vé trúng thưởng": item,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Winners");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "DanhSachTrungThuong.xlsx");
  };

  // ==========================
  // ✅ START SPIN (quay mãi)
  // ==========================
  const handleStart = () => {
    if (spinning) return;

    setShowModal(false);
    setShowConfetti(false);
    setSpinning(true);

    // Quay liên tục (random digit)
    spinInterval.current = setInterval(() => {
      setDigits([
        randomDigit(),
        randomDigit(),
        randomDigit(),
        randomDigit(),
      ]);
    }, 80);
  };

  // ==========================
  // ✅ STOP SPIN (bấm dừng)
  // ==========================
  const handleStop = async () => {
    if (!spinning) return;

    clearInterval(spinInterval.current);

    // Chọn vé không trùng
    let finalResult = "";
    do {
      finalResult = generateTicketNumber().toString();
    } while (winnerList.includes(finalResult));

    const finalDigits = finalResult.split("").map(Number);

    // Slot dừng từng cột lần lượt
    let tempDigits = [...digits];

    for (let i = 0; i < 4; i++) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          tempDigits[i] = randomDigit();
          setDigits([...tempDigits]);
        }, 60);

        setTimeout(() => {
          clearInterval(interval);
          tempDigits[i] = finalDigits[i];
          setDigits([...tempDigits]);
          resolve();
        }, 700);
      });
    }

    // Show kết quả
    setWinnerNumber(finalResult);
    setWinnerList((prev) => [...prev, finalResult]);

    setShowModal(true);
    setShowConfetti(true);
    playSound();

    setTimeout(() => setShowConfetti(false), 5000);

    setSpinning(false);
  };

  return (
    <div className="spin-container">
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}

      {/* Title */}
      <div className="title">
        <h1>Hội Xuân Hương Tết Việt <br/>Bính Ngọ 2026</h1>
        <h2>
          🎟 Vé số may mắn 🎟
        </h2>
      </div>

      {/* Digits */}
      <div className="number-box">
        {digits.map((num, index) => (
          <div key={index} className="digit">
            {num}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="btn-group">
        {!spinning ? (
          <button className="spin-btn" onClick={handleStart}>
            🎰 QUAY
          </button>
        ) : (
          <button className="spin-btn stop-btn" onClick={handleStop}>
            ✋ DỪNG
          </button>
        )}

        <button className="spin-btn" onClick={exportExcel}>
          📂 Xuất Excel
        </button>
      </div>

      {/* Winner list */}
      <div className="winner-list">
        <h3>🎉 Vé đã trúng:</h3>
        <div className="winner-items">
          {winnerList.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>🎊 Chúc mừng!</h2>
            <p>Vé số may mắn trúng thưởng là:</p>

            <div className="modal-number">{winnerNumber}</div>

            <button className="close-btn" onClick={() => setShowModal(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
