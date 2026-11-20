// Cloud VM (no GPU): reuse the NFP kit's Chrome Headless Shell, CPU GL.
import { Config } from "@remotion/cli/config";
Config.setBrowserExecutable("/opt/nfp/chrome-headless-shell-linux64/chrome-headless-shell");
Config.setChromiumOpenGlRenderer("swangle");
Config.setConcurrency(4);
