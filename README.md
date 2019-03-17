# docker-scriptcraft

Docker image with Spigot 1.13 and Scriptcraft installed.

## Run

```bash
docker run -it -p 25665:25565 magikcraft/scriptcraft
```

When the server starts, you need to give yourself `op`. At the server console, type this:

```
op {your-minecraft-name-goes-here}
```

Make sure that you put your minecraft username in there. So, for example, if your Minecraft name is Rob123, you would type:

```
op Rob123
```

## Building

To build the image, run:

```bash
docker build -t magikcraft/scriptcraft .
```
