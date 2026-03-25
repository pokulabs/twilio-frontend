import { useEffect, useState } from "react";

import type { ChatInfo } from "../types/types";

function isPinnedChat(chat: ChatInfo, userEmail?: string | null) {
  return chat.isFlagged || (!!userEmail && chat.claimedBy === userEmail);
}

export function sortChats(
  chats: ChatInfo[],
  userEmail?: string | null,
): ChatInfo[] {
  return [...chats].sort((a, b) => {
    const aPinned = isPinnedChat(a, userEmail);
    const bPinned = isPinnedChat(b, userEmail);

    if (aPinned !== bPinned) {
      return aPinned ? -1 : 1;
    }

    return b.recentMsgDate.getTime() - a.recentMsgDate.getTime();
  });
}

export function useSortedChats(
  initialChats: ChatInfo[],
  userEmail?: string | null,
) {
  const [chats, setChats] = useState(() => sortChats(initialChats, userEmail));

  useEffect(() => {
    setChats((prevChats) => sortChats(prevChats, userEmail));
  }, [userEmail]);

  const setSortedChats = (
    updater: ((prevChats: ChatInfo[]) => ChatInfo[]) | ChatInfo[],
  ) => {
    setChats((prevChats) => {
      const updatedChats =
        typeof updater === "function" ? updater(prevChats) : updater;
      return sortChats(updatedChats, userEmail);
    });
  };

  return [chats, setSortedChats] as const;
}
