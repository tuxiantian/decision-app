// 顶部添加useRef导入
import { useState, useEffect, useRef } from 'react'; // 添加useRef

// 修改后的QuoteContent组件
const QuoteContent = ({ content }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      setIsOverflowing(ref.current.scrollHeight > ref.current.clientHeight);
    }
  }, [content]);

  return (
    <p
      ref={ref}
      className={`quote ${isOverflowing ? 'not-centered' : 'centered'}`}      
    >
      {content}
    </p>
  );
};

export default QuoteContent