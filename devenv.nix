{pkgs, ...}: {
  packages = [
    pkgs.git
    pkgs.docker
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm = {
      enable = true;
      package = pkgs.pnpm;
      install.enable = true;
    };
  };

  enterShell = ''
    echo "Welcome to Lilypad X development environment!"
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
}
