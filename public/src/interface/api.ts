export interface ApiError extends Error {
  response?: {
    data?: any;
    status?: number;
  };
  name: string;
}

export interface VoteResults {
  [key: number]: {
    upvotes: number;
    downvotes: number;
  };
}
