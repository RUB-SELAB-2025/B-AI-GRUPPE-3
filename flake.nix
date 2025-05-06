{
  inputs = {
    # This must be the stable nixpkgs if you're running the app on a
    # stable NixOS install.  Mixing EGL library versions doesn't work.
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-compat = {
      url = github:edolstra/flake-compat;
      flake = true;
    };
  };

  outputs = { self, nixpkgs, utils, rust-overlay, ... }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {inherit system ;};
omniview = pkgs.stdenv.mkDerivation rec {
            pname = "omniview";
            version = "1.0.2";

            src = pkgs.fetchzip {
                url = "https://github.com/skunkforce/OmniView/releases/download/v${version}/OmniView-v${version}-ubuntu.zip";
                hash = "sha256-CA9bqKV4SJ1Mq1sJvN4BOJtlHWG0DHLONgga/jHnGlU";
                stripRoot=false;
            };



  nativeBuildInputs = [
    pkgs.autoPatchelfHook
  ];


  buildInputs = [
pkgs.eudev
pkgs.xorg.libX11
pkgs.libgcc
pkgs.libgcc.lib
 ];

runtimeDependencies = [
pkgs.libGL
pkgs.glfw

];
            configurePhase = ''
                 mkdir -p $out
                 cp -r . $out
                 chmod +x $out/build/OmniView
            '';

        };
      in
      {
        packages.omniview = omniview; 
      });
}
