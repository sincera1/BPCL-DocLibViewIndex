
import * as React from 'react';

import styles from './BpclDocLibIndexView.module.scss';

import {
  IBpclDocLibIndexViewProps
} from './IBpclDocLibIndexViewProps';

import DocumentLibraryViewService, {
  IDocumentLibraryView
} from '../services/DocumentLibraryViewService';

export interface IBpclDocLibIndexViewState {
  views: IDocumentLibraryView[];
  isLoading: boolean;
  errorMessage: string;
  searchText: string;
}

export default class BpclDocLibIndexView
  extends React.Component<
    IBpclDocLibIndexViewProps,
    IBpclDocLibIndexViewState
  > {

  private _viewService: DocumentLibraryViewService;

  constructor(
    props: IBpclDocLibIndexViewProps
  ) {
    super(props);

    this.state = {
      views: [],
      isLoading: false,
      errorMessage: '',
      searchText: ''
    };

    this._viewService =
      new DocumentLibraryViewService(
        props.spHttpClient,
        props.webAbsoluteUrl
      );
  }

  public componentDidMount(): void {
    this.loadViews();
  }

  public componentDidUpdate(
    previousProps: IBpclDocLibIndexViewProps
  ): void {

    if (
      previousProps.libraryName !==
        this.props.libraryName ||

      previousProps.webAbsoluteUrl !==
        this.props.webAbsoluteUrl
    ) {
      this._viewService =
        new DocumentLibraryViewService(
          this.props.spHttpClient,
          this.props.webAbsoluteUrl
        );

      this.setState({
        searchText: ''
      });

      this.loadViews();
    }
  }

  /**
   * Fetch views for the selected document library.
   */
  private async loadViews(): Promise<void> {
    const libraryName: string =
      this.props.libraryName
        ? this.props.libraryName.trim()
        : '';

    if (!libraryName) {
      this.setState({
        views: [],
        isLoading: false,
        errorMessage: '',
        searchText: ''
      });

      return;
    }

    this.setState({
      isLoading: true,
      errorMessage: '',
      views: []
    });

    try {
      const views: IDocumentLibraryView[] =
        await this._viewService
          .getDocumentLibraryViews(libraryName);

      this.setState({
        views,
        isLoading: false,
        errorMessage: ''
      });

    } catch (error) {
      console.error(
        'Error loading document library views:',
        error
      );

      this.setState({
        views: [],
        isLoading: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to load document library views.'
      });
    }
  }

  /**
   * Update search text.
   */
  private handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {

    this.setState({
      searchText: event.target.value
    });
  };

  /**
   * Clear search text.
   */
  private clearSearch = (): void => {
    this.setState({
      searchText: ''
    });
  };

  /**
   * Open selected view in a new tab.
   */
  private openView(
    view: IDocumentLibraryView
  ): void {

    const viewUrl: string =
      view.ServerRelativeUrl.indexOf('http') === 0
        ? view.ServerRelativeUrl
        : `${window.location.origin}${view.ServerRelativeUrl}`;

    window.open(
      viewUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  public render(): React.ReactElement<IBpclDocLibIndexViewProps> {

    const {
      views,
      isLoading,
      errorMessage,
      searchText
    } = this.state;

    const libraryName: string =
      this.props.libraryName
        ? this.props.libraryName.trim()
        : '';

    /**
     * Filter views based on search text.
     * Search is case-insensitive.
     */
    const filteredViews: IDocumentLibraryView[] =
      views.filter(
        (view: IDocumentLibraryView) =>
          view.Title
            .toLowerCase()
            .indexOf(searchText.trim().toLowerCase()) !== -1
      );

    return (

      <div className={styles.bpclDocLibIndexView}>

        {/* Main Card */}
        <div className={styles.mainCard}>

          {/* Header Section */}
          <div className={styles.headerSection}>

            <div className={styles.headerIcon}>
              <i
                className="bi bi-folder2-open"
                aria-hidden="true"
              />
            </div>

            <div className={styles.headerContent}>

              <h2 className={styles.title}>
                Document Library Views
              </h2>

              {libraryName && (
                <div className={styles.libraryName}>
                  Library:{' '}
                  <strong>{libraryName}</strong>
                </div>
              )}

            </div>

          </div>

          <div className={styles.headerDivider} />

          {/* No Library Selected */}
          {!libraryName && !isLoading && (

            <div
              className="alert alert-info"
              role="alert"
            >
              Please select a document library
              from the web part properties.
            </div>

          )}

          {/* Loading */}
          {isLoading && (

            <div className={styles.loadingContainer}>

              <div
                className="spinner-border spinner-border-sm"
                role="status"
                aria-label="Loading"
              />

              <span className={styles.loadingText}>
                Loading views...
              </span>

            </div>

          )}

          {/* Error */}
          {!isLoading && errorMessage && (

            <div
              className="alert alert-danger"
              role="alert"
            >
              {errorMessage}
            </div>

          )}

          {/* Search and Table */}
          {!isLoading &&
            !errorMessage &&
            libraryName &&
            views.length > 0 && (

            <>

              {/* Search Section */}
              <div className={styles.searchSection}>

                <div className={styles.searchWrapper}>

                  <i
                    className={`bi bi-search ${styles.searchIcon}`}
                    aria-hidden="true"
                  />

                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search views..."
                    value={searchText}
                    onChange={this.handleSearchChange}
                    aria-label="Search document library views"
                  />

                  {searchText && (

                    <button
                      type="button"
                      className={styles.clearButton}
                      onClick={this.clearSearch}
                      aria-label="Clear search"
                      title="Clear search"
                    >
                      <i
                        className="bi bi-x-circle-fill"
                        aria-hidden="true"
                      />
                    </button>

                  )}

                </div>

              </div>

              {/* Views Table */}
              {filteredViews.length > 0 ? (

                <div className={styles.tableContainer}>

                  <div className="table-responsive">

                    <table
                      className={
                        `table table-hover align-middle mb-0 ` +
                        styles.viewsTable
                      }
                    >

                      <thead>

                        <tr>

                          <th
                            className={styles.serialColumn}
                          >
                            Sr No
                          </th>

                          <th>
                            View
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredViews.map(
                          (
                            view: IDocumentLibraryView,
                            index: number
                          ) => (

                            <tr key={view.Id}>

                              <td
                                className={styles.serialColumn}
                              >
                                {index + 1}
                              </td>

                              <td>

                                <div className={styles.viewCell}>

                                  <button
                                    type="button"
                                    className={styles.viewLink}
                                    onClick={() =>
                                      this.openView(view)
                                    }
                                    title={`Open ${view.Title}`}
                                  >
                                    {view.Title}
                                  </button>

                                  {view.DefaultView && (

                                    <span
                                      className={
                                        styles.defaultBadge
                                      }
                                    >
                                      Default
                                    </span>

                                  )}

                                </div>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              ) : (

                <div
                  className={styles.noResultsContainer}
                  role="status"
                >
                  <i
                    className="bi bi-search"
                    aria-hidden="true"
                  />

                  <div className={styles.noResultsTitle}>
                    No views found
                  </div>

                  <div className={styles.noResultsText}>
                    Try searching with a different view name.
                  </div>

                </div>

              )}

            </>

          )}

          {/* No Views Available */}
          {!isLoading &&
            !errorMessage &&
            libraryName &&
            views.length === 0 && (

            <div
              className="alert alert-warning"
              role="alert"
            >
              No visible views found for this
              document library.
            </div>

          )}

        </div>

      </div>

    );
  }
}