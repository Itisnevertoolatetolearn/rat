package common

const (
	PingHeader         PacketHeader = 0
	ComputerInfoHeader PacketHeader = 5
	ScreenHeader       PacketHeader = 10
	ProcessHeader      PacketHeader = 11
	MonitorsHeader     PacketHeader = 12
	DirectoryHeader    PacketHeader = 13
	TransferHeader     PacketHeader = 14
	GetFileHeader      PacketHeader = 15 // Download file from client
)
