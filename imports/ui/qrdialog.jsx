import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@material-ui/core";
import QRCode from 'qrcode';

export default function QRDialog({ url, open, handleClose }) {

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Teilen per QRCode"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {open && url ? <canvas id="qrcode-canvas" ref={(ref) => {
                        ref && QRCode.toCanvas(ref, url);
                    }}></canvas> : null}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary" autoFocus>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>);
}