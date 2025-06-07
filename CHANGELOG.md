# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added 
- Initial Angular Setup (#8)
- Initial Electron Setup (#10) 
- Autostart of OmnAIScope Backend (#11)
- Start OmnAIScope Backend on a free port (#13)
- Initial README.md and CONTRIBUTION.md (#14)
- Add postinstall script (#15)
- Set up dynamic port handling between Electron and Angular app (#18)
- Create PortService and ApiService to retrieve device list via REST API (#18)
- Introduce DeviceListComponent to visualize available devices (#18)
- Add DataSourceService for reactive data management in the graph (#18)
- Initialize GraphComponent with zoomable x/y axes using D3 (#18)
- Implement responsive axis drawing with ResizeObserver directive (#18)
- Provide default random data source for development and debugging (#18)
- Establish WebSocket communication with backend for live data (#18)
- Separate configuration for Electron and dev server environments (#18)
- Apply basic SSR compatibility (guard browser-only APIs) (#18)
- Add dummy data server for debugging live graph rendering (#18)
- Add Icon (#19)
- Adding compodoc (#23)
- Adding changelog information to the Contribution.md (#41)
- Add import for csv-files (#39)
Formatting needs to be similar to the dataformat of the old OmnAIView data exports. For more infos, see comments in code.

### Changed 

- BREAKING CHANGE: Update OmnAIScope Dataserver from v0.4.0 to v0.5.0
- Modernize codebase to Angular 19 (inject, signals, @if/@for, etc.) (#18)
- Configure Angular Material with a custom theme (#18)
- Fix the Port selection for the OmnAIScope backend (#19)

### Removed 

- Deletetion of deprecated Angular 18 patterns (#18)