{
  description = "Lilypad X - Modern Docker container management with Turborepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Node.js 24 with pnpm
        nodejs = pkgs.nodejs_24;
        pnpm = pkgs.pnpm;
        
      in {
        # Development shell
        devShells.default = pkgs.mkShell {
          name = "lilypad-dev";
          
          buildInputs = [
            nodejs
            pnpm
            pkgs.git
            pkgs.docker
          ];
          
          shellHook = ''
            echo "🐸 Welcome to Lilypad X development environment!"
            echo ""
            echo "Node.js version: $(node --version)"
            echo "pnpm version: $(pnpm --version)"
            echo ""
            echo "Quick start:"
            echo "  pnpm install    # Install dependencies"
            echo "  pnpm dev        # Start development server"
            echo ""
            echo "Available commands:"
            echo "  pnpm build      # Build all packages"
            echo "  pnpm lint       # Lint all packages"
            echo "  pnpm docker:build  # Build Docker image"
            echo ""
          '';
        };

        # Package for building
        packages.default = pkgs.stdenv.mkDerivation {
          name = "lilypad";
          src = ./.;
          
          buildInputs = [
            nodejs
            pnpm
          ];
          
          buildPhase = ''
            export HOME=$TMPDIR
            pnpm install --frozen-lockfile
            pnpm build
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r apps/api/* $out/
            cp -r apps/web/build $out/
          '';
        };
      });
}
