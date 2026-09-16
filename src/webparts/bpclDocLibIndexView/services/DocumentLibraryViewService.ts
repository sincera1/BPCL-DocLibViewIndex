import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

export interface IDocumentLibraryView {
  Id: string;
  Title: string;
  ServerRelativeUrl: string;
  Hidden: boolean;
  DefaultView: boolean;
  PersonalView: boolean;
}

export default class DocumentLibraryViewService {
  private _spHttpClient: SPHttpClient;
  private _webAbsoluteUrl: string;

  constructor(
    spHttpClient: SPHttpClient,
    webAbsoluteUrl: string
  ) {
    this._spHttpClient = spHttpClient;
    this._webAbsoluteUrl = webAbsoluteUrl;
  }

  public async getDocumentLibraryViews(
    libraryName: string
  ): Promise<IDocumentLibraryView[]> {
    const escapedLibraryName: string = libraryName
      .trim()
      .replace(/'/g, "''");

    const endpoint: string =
      `${this._webAbsoluteUrl}` +
      `/_api/web/lists/getbytitle('${escapedLibraryName}')/views` +
      `?$select=Id,Title,ServerRelativeUrl,Hidden,DefaultView,PersonalView` +
      `&$filter=Hidden eq false` +
      `&$orderby=Title asc`;

    const response: SPHttpClientResponse =
      await this._spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept: 'application/json;odata=nometadata'
          }
        }
      );

    if (!response.ok) {
      const errorText: string = await response.text();

      throw new Error(
        `Unable to load document library views. ` +
        `Status: ${response.status}. ${errorText}`
      );
    }

    const data: {
      value: IDocumentLibraryView[];
    } = await response.json();

    return data.value || [];
  }
}


