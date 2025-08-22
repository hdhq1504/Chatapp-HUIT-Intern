import { useEffect, useRef } from 'react';

export const useClickOutside = (callback, isOpen = true) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, isOpen]);

  return ref;
};

export const useMultipleClickOutside = () => {
  const refs = useRef({});
  const callbacks = useRef({});

  const registerClickOutside = (id, callback, isOpen = true) => {
    if (!refs.current[id]) {
      refs.current[id] = { current: null };
    }

    callbacks.current[id] = { callback, isOpen };

    return refs.current[id];
  };

  const unregisterClickOutside = (id) => {
    delete refs.current[id];
    delete callbacks.current[id];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(callbacks.current).forEach(
        ([id, { callback, isOpen }]) => {
          const ref = refs.current[id];

          if (isOpen && ref?.current && !ref.current.contains(event.target)) {
            callback();
          }
        },
      );
    };

    const hasOpenElements = Object.values(callbacks.current).some(
      ({ isOpen }) => isOpen,
    );

    if (hasOpenElements) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    registerClickOutside,
    unregisterClickOutside,
  };
};

export const useClickOutsideWithException = (
  callback,
  isOpen = true,
  triggerSelector = null,
) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isOpen || !ref.current) return;

      if (ref.current.contains(event.target)) return;

      if (triggerSelector) {
        const triggerElement = event.target.closest(triggerSelector);
        if (triggerElement) return;
      }

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
