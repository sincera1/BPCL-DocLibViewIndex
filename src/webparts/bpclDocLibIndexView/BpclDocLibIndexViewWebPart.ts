import * as React from 'react';
import * as ReactDom from 'react-dom';

import { Version } from '@microsoft/sp-core-library';

import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import BpclDocLibIndexView
  from './components/BpclDocLibIndexView';

import {
  IBpclDocLibIndexViewProps
} from './components/IBpclDocLibIndexViewProps';

export interface IBpclDocLibIndexViewWebPartProps {
  description: string;
  libraryName: string;
}

export default class BpclDocLibIndexViewWebPart
  extends BaseClientSideWebPart<
    IBpclDocLibIndexViewWebPartProps
  > {

  private _isDarkTheme: boolean = false;

  private _environmentMessage: string = '';

  private _libraryOptions:
    IPropertyPaneDropdownOption[] = [];

  private _isLoadingLibraries: boolean = false;

  protected async onInit(): Promise<void> {
    await this._loadEnvironmentMessage();
    await this._loadDocumentLibraries();
  }

  private async _loadEnvironmentMessage(): Promise<void> {
    if (this.context.sdks.microsoftTeams) {
      this._environmentMessage =
        'You are running this web part in Microsoft Teams.';
    } else {
      this._environmentMessage =
        'You are running this web part in SharePoint.';
    }
  }

  /**
   * Load all visible document libraries
   * from the current SharePoint site.
   */
  private async _loadDocumentLibraries(): Promise<void> {
    if (this._isLoadingLibraries) {
      return;
    }

    this._isLoadingLibraries = true;

    try {
      const endpoint: string =
        `${this.context.pageContext.web.absoluteUrl}` +
        `/_api/web/lists` +
        `?$select=Id,Title,BaseTemplate,Hidden` +
        `&$filter=BaseTemplate eq 101 and Hidden eq false` +
        `&$orderby=Title asc`;

      const response: SPHttpClientResponse =
        await this.context.spHttpClient.get(
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
          `Unable to load document libraries. ` +
          `Status: ${response.status}. ${errorText}`
        );
      }

      const data: {
        value: Array<{
          Id: string;
          Title: string;
        }>;
      } = await response.json();

      this._libraryOptions = data.value.map(
        (library) => ({
          key: library.Title,
          text: library.Title
        })
      );

    } catch (error) {
      console.error(
        'Error loading document libraries:',
        error
      );

      this._libraryOptions = [];

    } finally {
      this._isLoadingLibraries = false;

      if (this.context.propertyPane) {
        this.context.propertyPane.refresh();
      }
    }
  }

  /**
   * Render React component.
   */
  public render(): void {
    const componentProps: IBpclDocLibIndexViewProps = {
      description: this.properties.description || '',

      isDarkTheme: this._isDarkTheme,

      environmentMessage: this._environmentMessage,

      hasTeamsContext:
        !!this.context.sdks.microsoftTeams,

      userDisplayName:
        this.context.pageContext.user.displayName,

      webAbsoluteUrl:
        this.context.pageContext.web.absoluteUrl,

      libraryName:
        this.properties.libraryName || '',

      spHttpClient:
        this.context.spHttpClient
    };

    const Component =
      BpclDocLibIndexView as React.ComponentType<
        IBpclDocLibIndexViewProps
      >;

    const element = React.createElement(
      Component,
      componentProps
    );

    ReactDom.render(
      element,
      this.domElement
    );
  }

  /**
   * Cleanup.
   */
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(
      this.domElement
    );
  }

  /**
   * Web part data version.
   */
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  /**
   * Property Pane.
   */
  protected getPropertyPaneConfiguration():
    IPropertyPaneConfiguration {

    if (
      this._libraryOptions.length === 0 &&
      !this._isLoadingLibraries
    ) {
      this._loadDocumentLibraries();
    }

    return {
      pages: [
        {
          header: {
            description: 'Configure document library'
          },

          groups: [
            {
              groupName: 'Document Library Settings',

              groupFields: [
                PropertyPaneDropdown(
                  'libraryName',
                  {
                    label: 'Select Document Library',

                    options: this._isLoadingLibraries
                      ? [
                          {
                            key: '',
                            text: 'Loading libraries...'
                          }
                        ]
                      : this._libraryOptions,

                    selectedKey:
                      this.properties.libraryName || ''
                  }
                )
              ]
            }
          ]
        }
      ]
    };
  }
}