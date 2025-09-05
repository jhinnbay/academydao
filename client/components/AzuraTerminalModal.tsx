import React, { useEffect, useMemo, useRef, useState } from "react";

interface AzuraTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: string[];
  onComplete?: () => void;
  autoProceedDelayMs?: number;
}

export const AzuraTerminalModal: React.FC<AzuraTerminalModalProps> = ({
  isOpen,
  onClose,
  messages,
  onComplete,
  autoProceedDelayMs = 600,
}) => {
  // Component disabled - return null
  return null;
};

export default AzuraTerminalModal;