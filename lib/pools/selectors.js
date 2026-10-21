export const POOL_FILTERS = Object.freeze(['All','NFTs','TKNs','NUT','SNUT','pNUT','NUTcoins']);
export function selectPools(pools,{filter='All',search=''}={}) {
  const needle=search.trim().toLocaleLowerCase();
  return pools.filter(p=>
    (filter==='All' || p.categories.includes(filter)) &&
    (!needle || [p.name,p.flavor,p.platform,p.status,...p.assets].join(' ').toLocaleLowerCase().includes(needle))
  );
}
