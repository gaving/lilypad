{
  description = "Lilypad X - Container management in full bloom";

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
        bun = pkgs.bun;
        
      in {
        # Development shell
        devShells.default = pkgs.mkShell {
          name = "lilypad-dev";
          
          buildInputs = [
            nodejs
            pnpm
            bun
            pkgs.git
            pkgs.docker
          ];
          
          shellHook = ''
            echo "🌸 Welcome to Lilypad X development environment!"
            echo ""
            echo "Node.js version: $(node --version)"
            echo "pnpm version: $(pnpm --version)"
            echo "Bun version: $(bun --version)"
            echo ""
            echo "Quick start:"
            echo "  pnpm install    # Install dependencies with pnpm"
            echo "  bun install     # Install dependencies with Bun"
            echo "  pnpm dev        # Start development server"
            echo ""
            echo "Available commands:"
            echo "  pnpm build      # Build all packages"
            echo "  pnpm lint       # Lint all packages"
            echo "  pnpm docker:build  # Build Docker image"
            echo ""
            echo "Bun commands:"
            echo "  bun run server.ts  # Run API with Bun (no build needed!)"
            echo "  bun --watch server.ts  # Run API with hot reload"
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
