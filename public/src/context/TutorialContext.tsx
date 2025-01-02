import { createContext, useContext, useState } from "react";

interface TutorialContextType {
  startTutorial: () => void;
  endTutorial: () => void;
  isTutorialActive: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export const TutorialProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);

  const startTutorial = () => {
    setIsTutorialActive(true);
  };

  const endTutorial = () => {
    setIsTutorialActive(false);
  };

  return (
    <TutorialContext.Provider
      value={{ startTutorial, endTutorial, isTutorialActive }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
