import { ServerStatus } from '../types/index.js';
import { sshService } from './sshService.js';
import { CONFIG } from '../config/env.js';

class ServerStatusService {
  async getStatus(sessionId: string): Promise<ServerStatus> {
    const status: ServerStatus = {
      running: false,
    };

    try {
      const running = await this.checkRunning(sessionId);
      status.running = running;

      if (running) {
        const [cpuOutput, ramOutput, playerOutput, tpsOutput, uptimeOutput, versionOutput, propsOutput] =
          await Promise.all([
            this.getCpuUsage(sessionId).catch(() => undefined),
            this.getRamUsage(sessionId).catch(() => undefined),
            this.getPlayers(sessionId).catch(() => undefined),
            this.getTps(sessionId).catch(() => undefined),
            this.getUptime(sessionId).catch(() => undefined),
            this.getVersion(sessionId).catch(() => undefined),
            this.getServerProperties(sessionId).catch(() => undefined),
          ]);

        if (cpuOutput !== undefined) {
          status.cpuUsage = cpuOutput;
        }

        if (ramOutput !== undefined) {
          status.ramUsage = ramOutput;
        }

        if (playerOutput !== undefined) {
          status.players = playerOutput;
        }

        if (tpsOutput !== undefined) {
          status.tps = tpsOutput;
        }

        if (uptimeOutput !== undefined) {
          status.uptime = uptimeOutput;
        }

        if (versionOutput !== undefined) {
          status.version = versionOutput.version;
          status.type = versionOutput.type;
        }

        if (propsOutput !== undefined) {
          status.port = propsOutput.port;
          status.motd = propsOutput.motd;
        }
      }
    } catch {
      // return partial status on error
    }

    return status;
  }

  private async checkRunning(sessionId: string): Promise<boolean> {
    try {
      const output = await sshService.executeCommand(
        sessionId,
        `pgrep -f 'minecraft|server.jar' | head -1`
      );
      return output.trim().length > 0 && !isNaN(parseInt(output.trim(), 10));
    } catch {
      return false;
    }
  }

  private async getCpuUsage(sessionId: string): Promise<number> {
    const output = await sshService.executeCommand(
      sessionId,
      `ps aux | grep -v grep | grep -E 'minecraft|server.jar' | awk '{print $3}'`
    );
    const match = output.trim().match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private async getRamUsage(sessionId: string): Promise<{
    used: number;
    total: number;
    percent: number;
  }> {
    const output = await sshService.executeCommand(
      sessionId,
      `ps aux | grep -v grep | grep -E 'minecraft|server.jar' | awk '{print $4,$6}'`
    );
    const lines = output.trim().split('\n');
    const validLines = lines.filter((l) => l.length > 0);

    if (validLines.length === 0) {
      const freeOutput = await sshService.executeCommand(sessionId, 'free -m');
      const match = freeOutput.match(/Mem:\s+(\d+)\s+(\d+)/);
      if (match) {
        return {
          total: parseInt(match[1], 10),
          used: parseInt(match[2], 10),
          percent: Math.round((parseInt(match[2], 10) / parseInt(match[1], 10)) * 100),
        };
      }
      return { used: 0, total: 0, percent: 0 };
    }

    const parts = validLines[0].trim().split(/\s+/);
    if (parts.length >= 2) {
      const memPercent = parseFloat(parts[0]);

      const freeOutput = await sshService.executeCommand(sessionId, 'free -m');
      const match = freeOutput.match(/Mem:\s+(\d+)\s+(\d+)/);
      if (match) {
        const total = parseInt(match[1], 10);
        return {
          total,
          used: Math.round((memPercent / 100) * total),
          percent: Math.round(memPercent),
        };
      }
    }

    return { used: 0, total: 0, percent: 0 };
  }

  private async getPlayers(sessionId: string): Promise<{
    online: number;
    max: number;
    list: string[];
  }> {
    const output = await sshService.executeCommand(sessionId, 'list');
    const match = output.match(
      /There are (\d+) of a max of (\d+) players online:\s*(.*)/
    );

    if (match) {
      const online = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);
      const list = match[3]
        ? match[3]
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      return { online, max, list };
    }

    const simpleMatch = output.match(/There are (\d+) of a max of (\d+) players online/);
    if (simpleMatch) {
      return {
        online: parseInt(simpleMatch[1], 10),
        max: parseInt(simpleMatch[2], 10),
        list: [],
      };
    }

    return { online: 0, max: 0, list: [] };
  }

  private async getTps(sessionId: string): Promise<number[]> {
    const output = await sshService.executeCommand(sessionId, 'tps');
    const tpsValues: number[] = [];

    const matches = output.matchAll(/[\w\s]+:\s*(\d+\.\d+)/g);
    for (const match of matches) {
      tpsValues.push(parseFloat(match[1]));
    }

    return tpsValues.length > 0 ? tpsValues : [];
  }

  private async getUptime(sessionId: string): Promise<number> {
    const output = await sshService.executeCommand(
      sessionId,
      `ps -o etimes= -p $(pgrep -f 'minecraft|server.jar' | head -1) 2>/dev/null`
    );
    const match = output.trim().match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private async getVersion(sessionId: string): Promise<{
    version: string;
    type: string;
  }> {
    try {
      const output = await sshService.executeCommand(
        sessionId,
        `ls -la ${CONFIG.SERVER_DIR}/ | grep -E '\.jar$' | head -1`
      );
      const jarMatch = output.match(/([\w\-.]*server[\w\-.]*\.jar)/i);
      const jarName = jarMatch ? jarMatch[1] : 'server.jar';

      let type = 'Vanilla';
      if (/fabric/i.test(jarName)) type = 'Fabric';
      else if (/forge/i.test(jarName)) type = 'Forge';
      else if (/paper/i.test(jarName)) type = 'Paper';
      else if (/spigot/i.test(jarName)) type = 'Spigot';
      else if (/bukkit/i.test(jarName)) type = 'Bukkit';
      else if (/purpur/i.test(jarName)) type = 'Purpur';

      const out = await sshService.executeCommand(
        sessionId,
        `java -jar ${jarName} --version 2>&1 | head -5`
      );
      const verMatch = out.match(/(\d+\.\d+(\.\d+)?)/);
      const version = verMatch ? verMatch[1] : 'Unknown';

      return { version, type };
    } catch {
      return { version: 'Unknown', type: 'Vanilla' };
    }
  }

  private async getServerProperties(
    sessionId: string
  ): Promise<{ port: number; motd: string } | undefined> {
    try {
      const output = await sshService.executeCommand(
        sessionId,
        `cat ${CONFIG.SERVER_DIR}/server.properties 2>/dev/null | grep -E '^(server-port|motd)='`
      );
      const result: { port?: number; motd?: string } = {};

      const portMatch = output.match(/server-port=(\d+)/);
      if (portMatch) result.port = parseInt(portMatch[1], 10);

      const motdMatch = output.match(/motd=(.+)/);
      if (motdMatch) result.motd = motdMatch[1].trim();

      return result as { port: number; motd: string };
    } catch {
      return undefined;
    }
  }
}

export const serverStatusService = new ServerStatusService();
