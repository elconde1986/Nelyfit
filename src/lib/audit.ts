import { prisma } from './prisma';
import { Role, AuditActionType } from '@prisma/client';

type AuditMetadata = Record<string, any>;

interface CreateAuditLogParams {
  actorId: string;
  actorRole: Role;
  actionType: AuditActionType;
  targetType: string;
  targetId: string;
  metadata?: AuditMetadata;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Creates an audit log entry for tracking important system changes
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorRole: params.actorRole,
        actionType: params.actionType,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break main functionality
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper to get IP address and user agent from request headers
 */
export function getRequestMetadata(headers: Headers): {
  ipAddress?: string;
  userAgent?: string;
} {
  return {
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0] || 
               headers.get('x-real-ip') || 
               undefined,
    userAgent: headers.get('user-agent') || undefined,
  };
}

