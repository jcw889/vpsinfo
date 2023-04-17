bash
#!/bin/bash 
# VPS 一键信息查看脚本

CLEAR=`clear` 
echo -e "\n\n\033[32;42m   ***** VPS 一键配置信息查看脚本 *****   \033[0m\n"

# CPU 信息
CPU_MODEL=`cat /proc/cpuinfo | grep 'model name' | cut -f2 -d: | uniq`
CPU_CORES=`cat /proc/cpuinfo| grep 'processor' | wc -l` 
CPU_MHZ=`cat /proc/cpuinfo | grep 'cpu MHz' | cut -f2 -d:`

# 内存信息 
MEM_TOTAL=`free -m | grep Mem | awk '{print $2}'`
MEM_USED=`free -m | grep Mem | awk '{print $3}'`
MEM_FREE=`free -m | grep Mem | awk '{print $4}'`

# 磁盘信息
DISK_TOTAL=`df -h | grep dev/vda1 | awk '{print $2}'` 
DISK_USED=`df -h | grep dev/vda1 | awk '{print $3}'` 
DISK_FREE=`df -h | grep dev/vda1 | awk '{print $4}'`

# IP 地址 
IP_ADDR=`ifconfig | grep inet | grep -v 127.0.0.1 | awk '{print $2}' | cut -f2 -d: `

echo -e "\n\033[32;42mCPU 型号: \033[0m$CPU_MODEL" 
echo -e "\033[32;42mCPU 核心数: \033[0m$CPU_CORES"
echo -e "\033[32;42mCPU 主频: \033[0m$CPU_MHZ MHz "  
echo -e "\n\033[32;42m内存总量: \033[0m$MEM_TOTAL MB"
echo -e "\033[32;42m内存使用: \033[0m$MEM_USED MB" 
echo -e "\033[32;42m内存空闲: \033[0m$MEM_FREE MB"

echo -e "\n\033[32;42m磁盘总量: \033[0m$DISK_TOTAL" 
echo -e "\033[32;42m磁盘使用: \033[0m$DISK_USED"
echo -e "\033[32;42m磁盘空闲: \033[0m$DISK_FREE"  

echo -e "\n\033[32;42mIPv4 地址: \033[0m$IP_ADDR"
