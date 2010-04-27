/*
 * Copyright 2009 JBoss, a divison Red Hat, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jboss.errai.bus.server;

import org.jboss.errai.bus.client.api.base.MessageDeliveryFailure;

/**
 * <tt>QueueOverloadedException</tt> extends the <tt>MessageDeliveryFailure</tt>. It is thrown when a queue is
 * completely maxed out with undelivered messages
 */
public class QueueOverloadedException extends MessageDeliveryFailure {
    private static final long serialVersionUID = 6014530858847384745L;

    public QueueOverloadedException() {
    }

    public QueueOverloadedException(String message) {
        super(message);
    }

    public QueueOverloadedException(String message, Throwable cause) {
        super(message, cause);
    }

    public QueueOverloadedException(Throwable cause) {
        super(cause);
    }
}
