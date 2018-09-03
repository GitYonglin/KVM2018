export interface LiveData {
  plcMpa: number;
  mpa: number;
  mm: number;
  alarmNumber: number;
  alarm: string[];
  state: string;
  setPLCMpa: number;
  connectState: boolean;
  connectMsg: string;
}
