#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Jun 10 04:20:54 2024

@author: saumya
"""

import aiohttp
import asyncio
from urllib.parse import urlsplit
import re

TTL_DNS_CACHE=300  # Time-to-live of DNS cache
MAX_TCP_CONN=50  # Throttle at max these many simultaneous connections
TIMEOUT_TOTAL=100  # Each request times out after these many seconds

async def unshortenone(url, session, pattern=None, maxlen=None, 
                       cache=None, timeout=None):
    # If user specified list of domains, check netloc is in it, otherwise set
    # to False (equivalent of saying there is always a match against the empty list)
    if pattern is not None:
        domain = urlsplit(url).netloc
        match = re.search(pattern, domain)
        no_match = (match is None)
    else:
        no_match = False
    # If user specified max URL length, check length, otherwise set to False
    # (equivalent to setting max length to infinity -- any length is OK)
    too_long = (maxlen is not None and len(url) > maxlen)
    # Ignore if either of the two exclusion criteria applies.
    if too_long or no_match:
        return url
    if cache is not None and url in cache:
        return str(cache[url])
    else:
        try:
            # await asyncio.sleep(0.01)
            resp = await session.head(url, timeout=timeout, 
                                      ssl=False, allow_redirects=True)
            expanded_url = str(resp.url)
            if url != expanded_url:
                if cache is not None and url not in cache:
                    # update cache if needed            
                    cache[url] = expanded_url
            return expanded_url
        except (aiohttp.ClientError, asyncio.TimeoutError, UnicodeError):
            return url


# Thanks: https://blog.jonlu.ca/posts/async-python-http
async def gather_with_concurrency(n, *tasks):
    semaphore = asyncio.Semaphore(n)
    async def sem_task(task):
        async with semaphore:
            return await task
    return await asyncio.gather(*(sem_task(task) for task in tasks))


async def _unshorten(*urls, cache=None, domains=None, maxlen=None):
    if domains is not None:
        pattern = re.compile(f"({'|'.join(domains)})", re.I)
    else:
        pattern = None
    conn = aiohttp.TCPConnector(ttl_dns_cache=TTL_DNS_CACHE, limit=None)
    u1 = unshortenone
    timeout = aiohttp.ClientTimeout(total=TIMEOUT_TOTAL)
    async with aiohttp.ClientSession(connector=conn) as session:
        return await gather_with_concurrency(MAX_TCP_CONN, 
                                             *(u1(u, session, cache=cache,
                                                  maxlen=maxlen,
                                                  pattern=pattern, 
                                                  timeout=timeout) for u in urls))


def unshorten(*args, **kwargs):
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(_unshorten(*args, **kwargs))


def unshorten_main(shorturls):
    urls = unshorten(*shorturls)
    return urls