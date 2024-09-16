export function ipfsUrl(cid: string) {
  if (window.location.hostname.includes("localhost")) return "https://ipfs.pintastic.link/ipfs/" + cid
  else return "/.netlify/images?url=https://ipfs.pintastic.link/ipfs/" + cid
}
