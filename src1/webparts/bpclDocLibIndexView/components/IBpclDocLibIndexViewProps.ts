import { SPHttpClient } from '@microsoft/sp-http';

export interface IBpclDocLibIndexViewProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  webAbsoluteUrl: string;
  libraryName: string;
  spHttpClient: SPHttpClient;
}