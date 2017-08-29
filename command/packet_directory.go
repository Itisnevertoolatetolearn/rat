package main

import (
	"encoding/json"
	"fmt"
	"rat/common"

	humanize "github.com/dustin/go-humanize"

	"golang.org/x/net/websocket"
)

type FileData struct {
	Dir    bool   `receive`
	Name   string `receive`
	Edited string `receive`
	Size   int64  `receive`
}

type DirectoryPacket struct {
	Path  string     `both`
	Files []FileData `receive`
}

func (packet DirectoryPacket) Header() common.PacketHeader {
	return common.DirectoryHeader
}

func (packet DirectoryPacket) Init(c *Client) {

}

type File struct {
	Dir  bool   `json:"directory"`
	Path string `json:"path"`
	Size string `json:"size"`
	Time string `json:"time"`
}

func (packet DirectoryPacket) OnReceive(c *Client) error {
	dirs := make([]File, 0)
	files := make([]File, 0)

	for _, file := range packet.Files {
		file := File{file.Dir, file.Name, humanize.Bytes(uint64(file.Size)), file.Edited}

		if file.Dir {
			dirs = append(dirs, file)
		} else {
			files = append(files, file)
		}
	}

	if ws, ok := c.Listeners[common.DirectoryHeader]; ok {
		json, err := json.Marshal(append(dirs, files...))

		if err != nil {
			fmt.Println(err)
		}

		event := newEvent(DirectoryQueryEvent, c.Id, string(json))

		err = websocket.JSON.Send(ws, &event)

		if err != nil {
			return err
		}
	}

	delete(c.Listeners, common.DirectoryHeader)

	return nil
}
