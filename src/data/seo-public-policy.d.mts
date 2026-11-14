export declare const SEO_INSTITUTIONAL_SLUGS: readonly string[];
export declare const SEO_REQUIRES_HUMAN_APPROVAL: readonly string[];
export declare function eligibleInstitutionalSlug(slug:string,options?:{editorialPreview?:boolean}):boolean;
export declare function eligibleInstitutionalPaths(pages:readonly {slug:string}[],options?:{editorialPreview?:boolean}):string[];
