package main

import (
	"encoding/json"
	"os"
	"rat/common"

	"path/filepath"

	"golang.org/x/net/websocket"
)

type Transfer struct {
	Local  *os.File
	Remote string
	Read   int64
	Total  int64
}

func (t *Transfer) Complete() bool {
	return t.Read == t.Total
}

type TransfersMap map[string]*Transfer

var Transfers TransfersMap

func init() {
	Transfers = make(TransfersMap)
}

type DownloadPacket struct {
	File  string `both`
	Total int64  `receive`
	Final bool   `receive`
	Part  []byte `receive`
}

func (packet DownloadPacket) Header() common.PacketHeader {
	return common.GetFileHeader
}

func (packet DownloadPacket) Init(c *Client) {

}

func (packet DownloadPacket) OnReceive(c *Client) error {
	transfer := Transfers[packet.File]
	transfer.Total = packet.Total
	transfer.Read += int64(len(packet.Part))
	_, err := transfer.Local.Write(packet.Part)

	if err != nil {
		return err
	}

	if ws, ok := c.Listeners[common.GetFileHeader]; ok {
		e := DownloadProgressEvent{packet.File, transfer.Read, transfer.Total, ""}

		if transfer.Complete() && packet.Final {
			// Set temp file mapping so that we can download it from the web panel
			tempKey := addDownload(TempFile{
				Path: transfer.Local.Name(),
				Name: filepath.Base(packet.File),
			})

			e.Key = tempKey
		}

		data, err := json.Marshal(&e)
		if err != nil {
			return err
		}

		event := newEvent(DownloadProgressUpdateEvent, c.Id, string(data))

		err = websocket.JSON.Send(ws, &event)

		if err != nil {
			return err
		}
	}

	if packet.Final {
		defer delete(Transfers, packet.File)
		defer delete(c.Listeners, common.GetFileHeader)

		err = transfer.Local.Sync()
		if err != nil {
			return err
		}

		err = transfer.Local.Close()
		if err != nil {
			return err
		}

		return nil
	}

	return err
}
