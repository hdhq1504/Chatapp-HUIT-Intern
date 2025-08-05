import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import Details from "../components/Details.jsx";

function ChatPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      if (mobile) {
        setShowSidebar(false);
        setShowDetails(false);
      } else if (tablet) {
        setShowDetails(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleChatSelect = () => {
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    if (isMobile) {
      setShowSidebar(true);
      setShowDetails(false);
    }
  };

  const handleToggleDetails = (show) => {
    if (isMobile) {
      setShowDetails(show);
      setShowSidebar(false);
    } else {
      setShowDetails(show);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-black dark:bg-[#303030] dark:text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed inset-0 z-40 ${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            }`
          : isTablet
            ? `fixed left-0 top-0 h-full z-30 ${
                showSidebar ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
        }
        ${!isMobile && !isTablet ? 'w-80' : 'w-full md:w-80'}
        h-full
      `}>
        <Sidebar 
          onChatSelect={handleChatSelect}
          onBackToSidebar={handleBackToSidebar}
          isMobile={isMobile}
          isTablet={isTablet}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {(isMobile || isTablet) && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex h-full">
        {/* Chat Container */}
        <div className={`
          flex-1 h-full
          ${isMobile && showSidebar ? 'hidden' : 'flex'} 
          ${isMobile && showDetails ? 'hidden' : 'flex'}
        `}>
          <ChatContainer 
            setShowDetails={handleToggleDetails}
            onBackToSidebar={handleBackToSidebar}
            isMobile={isMobile}
            isTablet={isTablet}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
          />
        </div>

        {/* Details Panel */}
        {showDetails && (
          <div className={`
            ${isMobile 
              ? 'fixed inset-0 z-40' 
              : isTablet 
                ? 'fixed right-0 top-0 h-full w-80 z-30' 
                : 'relative w-80'
            }
            h-full
          `}>
            <Details 
              onClose={() => handleToggleDetails(false)}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>
        )}
      </div>

      {/* Overlay for mobile/tablet details */}
      {(isMobile || isTablet) && showDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => handleToggleDetails(false)}
        />
      )}
    </div>
  );
}

export default ChatPage;