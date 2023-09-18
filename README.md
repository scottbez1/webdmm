# WebDMM

Tinkering around with Web Serial and the SCPI protocol supported by the Owon XDM1241 benchtop digital multimeter.

View the [demo](http://scottbez1.github.io/webdmm) -- plug in your XDM1241 over USB and click connect. No driver needed for most modern OSes (XDM1241 uses a CH340 serial chip internally).

See [TheHWcave's documentation](https://github.com/TheHWcave/OWON-XDM1041/blob/c8b477e8319eff24f6cb15448b65ce589c3bfa35/SCPI/XDM1041-SCPI.pdf) for some great
info on the serial protocol for the XDM1041. (The XDM1241 appears to be a minor variant of the XDM1041, which replaces the power line input with USB power and
rechargeable batteries but uses PCBs labeled XDM1041 internally).

If you're curious how the XDM1241 compares to the XDM1041, view some [photos I took of the inside](https://fosstodon.org/@scottbez1/111031258210996863).
