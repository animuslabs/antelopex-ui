import { Asset, Name, Struct } from "anchor-link"

@Struct.type("account")
export class Account extends Struct {
  @Struct.field(Asset) balance!:Asset
}

@Struct.type("close")
export class Close extends Struct {
  @Struct.field(Name) owner!:Name
  @Struct.field(Asset.Symbol) symbol!:Asset.Symbol
}

@Struct.type("create")
export class Create extends Struct {
  @Struct.field(Name) issuer!:Name
  @Struct.field(Asset) maximum_supply!:Asset
}

@Struct.type("currency_stats")
export class CurrencyStats extends Struct {
  @Struct.field(Asset) supply!:Asset
  @Struct.field(Asset) max_supply!:Asset
  @Struct.field(Name) issuer!:Name
}

@Struct.type("issue")
export class Issue extends Struct {
  @Struct.field(Name) to!:Name
  @Struct.field(Asset) quantity!:Asset
  @Struct.field("string") memo!:string
}

@Struct.type("open")
export class Open extends Struct {
  @Struct.field(Name) owner!:Name
  @Struct.field(Asset.Symbol) symbol!:Asset.Symbol
  @Struct.field(Name) ram_payer!:Name
}

@Struct.type("retire")
export class Retire extends Struct {
  @Struct.field(Asset) quantity!:Asset
  @Struct.field("string") memo!:string
}

@Struct.type("transfer")
export class Transfer extends Struct {
  @Struct.field(Name) from!:Name
  @Struct.field(Name) to!:Name
  @Struct.field(Asset) quantity!:Asset
  @Struct.field("string") memo!:string
}
