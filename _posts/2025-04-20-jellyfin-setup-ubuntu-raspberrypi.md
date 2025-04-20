---
layout: post
title: Setup Jellyfin On Raspberry Pi - Home Media Server
description: Set up your own Jellyfin media server on Raspberry Pi 5 running Ubuntu 24.04 with media files stored on a USB drive and shared over the network using Samba.
date: 2025-04-20 09:40:05 +0530
permalink: '/setup-jellyfin-on-raspberry-pi'
categories: ubuntu raspberrypi jellyfin
cover_image: '/assets/images/cover_image_2025-04-20.png'
image: '/assets/images/cover_image_2025-04-20.png'
---

In this guide, we’ll walk through setting up a personal media server using `Jellyfin` on a Raspberry Pi 5 running Ubuntu 24.04. We'll configure a USB drive as the media storage, mount it properly, auto-mount it at boot, and set up Samba so you can transfer media from your PC or laptop over the network. Great for anyone wanting a self-hosted Netflix-like experience.

<hr>

## Setting Up Jellyfin Media Server

### 📦 Step 1: Install Jellyfin

```bash
sudo apt update
curl -s https://repo.jellyfin.org/install-debuntu.sh | sudo bash
```

Once installed, Jellyfin runs on port `8096` by default.

Open it in your browser:

```
http://<your-pi-ip>:8096
```

Before setting up Jellyfin, lets go through other steps to add the media folders in Jellyfin server.

<hr>

### 🔌 Step 2: Connect Your USB Drive

1. Plug in your USB drive.
2. Ubuntu may **auto-mount it** under:
    ```
    /media/<your-username>/<usb-name>
    ```

👉 This location is fine temporarily, but it can **change** or fail to mount after a reboot — which is **not reliable** for a media server.

---

### 🔍 Step 3: Identify the USB Drive and Its Filesystem

To list connected drives:

```bash
lsblk
```

To get UUID and filesystem type:

```bash
sudo blkid
```

Look for your USB device, something like:

```
/dev/sda1: UUID="1234-ABCD" TYPE="exfat"
```

Copy the **UUID** and note the **TYPE** (e.g., `exfat`, `ntfs`, `ext4`, or `vfat`).

<hr>

### 📂 Step 4: Create a Permanent Mount Point

```bash
sudo mkdir -p /media/usbdrive
```

`usbdrive` can be anything. You can use your actual usb drive name for this.

<hr>

### 🛠 Step 5: Install Filesystem Support (if needed)

For `exFAT`:

```bash
sudo apt install exfat-fuse exfatprogs
```

For `NTFS`:

```bash
sudo apt install ntfs-3g
```

<hr>

### ⚙️ Step 6: Configure Auto-Mount with `/etc/fstab` (Based on Filesystem Type)

Edit your fstab:

```bash
sudo nano /etc/fstab
```

#### ✅ For `exfat` drives:

```fstab
UUID=1234-ABCD /media/usbdrive exfat uid=jellyfin,gid=jellyfin,umask=0022,nofail,x-systemd.automount 0 0
```

#### ✅ For `ext4` drives:

```fstab
UUID=1234-ABCD /media/usbdrive ext4 defaults,nofail,x-systemd.automount 0 2
```

#### ✅ For `ntfs` drives:

```fstab
UUID=1234-ABCD /media/usbdrive ntfs-3g uid=jellyfin,gid=jellyfin,umask=0022,nofail,x-systemd.automount 0 0
```

#### ✅ For `vfat` (FAT32) drives:

```fstab
UUID=1234-ABCD /media/usbdrive vfat uid=jellyfin,gid=jellyfin,umask=0022,nofail,x-systemd.automount 0 0
```

After saving, mount all drives:

```bash
sudo mount -a
```

Check if the drive mounted:

```bash
ls /media/usbdrive
```

<hr>

### 🔑 Step 7: Fix Permissions (if needed)

```bash
sudo chown -R jellyfin:jellyfin /media/usbdrive
sudo chmod -R 755 /media/usbdrive
```

<hr>

### 🎞 Step 8: Add USB Folder to Jellyfin

1. Open `http://<your-pi-ip>:8096`
2. Go to **Dashboard → Libraries**
3. Create a new library (e.g. "Movies")
4. Set the path to:
    ```
    /media/usbdrive
    ```
5. Save and scan the library

{:.blockquote}

> If you’re more old-school, you can simply disconnect the USB drive from your Raspberry Pi and connect it to another laptop to transfer files. But if you’d prefer to avoid that hassle and transfer files over the network, stick around — we’ll set up a Samba server to make file sharing seamless and easy.

## Transfering Files

We can install Samba on Ubuntu to access the USB drive over the network from other PCs or laptops. However, currently only the `jellyfin` user has full permission to modify or delete files on the USB drive.

To fix this, we’ll create a shared group, add both the `jellyfin` and `pi` users to it, and then mount the USB drive using this shared group to ensure proper access for both users.

### 📁 Step 9. Mount USB Drive as a Shared Group

1. Create and assign group:

    ```bash
    sudo groupadd media
    sudo usermod -aG media pi
    sudo usermod -aG media jellyfin
    ```

2. FSTAB entry:

    ```bash
    UUID=XXXX-XXXX  /media/usbdrive  exfat  defaults,uid=pi,gid=media,umask=0002,nofail,x-systemd.automount  0  0
    ```

3. Reload:

    ```bash
    sudo umount /media/usbdrive
    sudo mount -a
    ```

To check ownership:

```bash
ls -ld /media/usbdrive
```

<hr>

### 🌐 Step 10. Set up Samba for File Transfers

1. Install Samba:

    ```bash
    sudo apt install samba samba-common-bin
    ```

2. Create a new config block at the end of `/etc/samba/smb.conf`:

    Run:

    ```bash
    sudo nano /etc/samba/smb.conf
    ```

    Add the below config

    ```ini
    [usbonpi]
      path = /media/usbdrive
      writeable = yes
      browseable = yes
      public = no
      read only = no
      guest ok = no
      force user = pi
      force group = pi
      create mask = 0777
      directory mask = 0777
      delete readonly = yes
    ```

3. Reload Samba Service:

    ```bash
    sudo systemctl restart smbd
    ```

4. Add a Samba user:

    ```bash
    sudo smbpasswd -a pi
    ```

**Access the share via another PC:**

If you are on Mac:

1. Open Finder
2. Go to `Go` > `Connect to Server`
3. Type the following:

    ```
    smb://<raspberrypi_ip>\usbonpi
    ```

If you are on Windows:

1. Open File Explorer
2. In the address bar, type the following:

    ```
    \\<raspberrypi_ip>\usbonpi
    ```

<hr>

## 📋 Summary

-   We installed Jellyfin and accessed it via a browser.
-   A USB drive was configured to auto-mount using `fstab`.
-   Permissions were assigned to allow both Jellyfin and the Samba-accessing user.
-   A Samba server was set up for easy file transfer.

✅ You're All Set! 🎉

Your Raspberry Pi is now a full-fledged Jellyfin server with a persistent, auto-mounted USB drive as the media library.
