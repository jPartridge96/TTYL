# Changelog

All notable changes to TOTYL's full stack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.32] - 2023-04-05

### Added

- New front end for account creation
- Database schema for handling TOTYL's back-end
- config.json now has 'min-ver', which determines the lowest client version that can connect
- Twilio OTP has been fully implemented, restricting users from pages before verification
- Event handlers and validators are now on 'account' and 'authenticate' components

### Fixed

- Server logging is now functional again

### Changed

- 'min-ver' is now set to '0.1'

### Removed

- Legacy OTP imports in server commands