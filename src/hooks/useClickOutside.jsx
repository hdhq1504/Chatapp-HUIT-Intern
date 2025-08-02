import { useEffect, useRef } from 'react';

/**
 * Custom hook để xử lý việc click outside một element để đóng menu/dropdown
 * @param {Function} callback - Hàm được gọi khi click outside
 * @param {boolean} isOpen - Trạng thái mở/đóng của element cần theo dõi
 * @returns {Object} - Ref object để gán cho element cần theo dõi
 */
export const useClickOutside = (callback, isOpen = true) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Chỉ xử lý khi element đang mở và click không nằm trong element
      if (isOpen && ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    // Chỉ add event listener khi element đang mở
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, isOpen]);

  return ref;
};

/**
 * Custom hook nâng cao để xử lý multiple refs với các callback riêng biệt
 * Phù hợp cho trường hợp có nhiều menu cần xử lý khác nhau
 */
export const useMultipleClickOutside = () => {
  const refs = useRef({});
  const callbacks = useRef({});

  /**
   * Đăng ký một element cần theo dõi click outside
   * @param {string|number} id - ID duy nhất của element
   * @param {Function} callback - Hàm được gọi khi click outside
   * @param {boolean} isOpen - Trạng thái mở/đóng
   */
  const registerClickOutside = (id, callback, isOpen = true) => {
    // Tạo ref nếu chưa tồn tại
    if (!refs.current[id]) {
      refs.current[id] = { current: null };
    }
    
    // Lưu callback
    callbacks.current[id] = { callback, isOpen };
    
    return refs.current[id];
  };

  /**
   * Hủy đăng ký một element
   * @param {string|number} id - ID của element cần hủy
   */
  const unregisterClickOutside = (id) => {
    delete refs.current[id];
    delete callbacks.current[id];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Duyệt qua tất cả các element đã đăng ký
      Object.entries(callbacks.current).forEach(([id, { callback, isOpen }]) => {
        const ref = refs.current[id];
        
        // Kiểm tra điều kiện và gọi callback
        if (isOpen && ref?.current && !ref.current.contains(event.target)) {
          callback();
        }
      });
    };

    // Kiểm tra có element nào đang mở không
    const hasOpenElements = Object.values(callbacks.current).some(({ isOpen }) => isOpen);
    
    if (hasOpenElements) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    registerClickOutside,
    unregisterClickOutside
  };
};

/**
 * Custom hook cho trường hợp đặc biệt: click outside nhưng loại trừ trigger button
 * @param {Function} callback - Hàm được gọi khi click outside
 * @param {boolean} isOpen - Trạng thái mở/đóng
 * @param {string} triggerSelector - CSS selector của trigger button cần loại trừ
 * @returns {Object} - Ref object
 */
export const useClickOutsideWithException = (callback, isOpen = true, triggerSelector = null) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isOpen || !ref.current) return;

      // Kiểm tra xem có click vào element được theo dõi không
      if (ref.current.contains(event.target)) return;

      // Kiểm tra xem có click vào trigger button không (nếu có triggerSelector)
      if (triggerSelector) {
        const triggerElement = event.target.closest(triggerSelector);
        if (triggerElement) return; // Không đóng nếu click vào trigger
      }

      // Gọi callback để đóng
      callback();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, isOpen, triggerSelector]);

  return ref;
};
